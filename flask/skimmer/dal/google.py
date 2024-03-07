import string
import sys
from base64 import urlsafe_b64decode
from itertools import islice

import jwt
import requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from skimmer.config import Config
from skimmer.dal.dto import ExternalMessage
from skimmer.dal.models import ChannelType
from skimmer.dal.queries import create_or_update_channel, fetch_channel_tokens

RANDOM_CHARACTERS = string.ascii_lowercase + string.digits


def submit_oauth_code(code):
    result = requests.post(
        Config.Google.URL_TOKEN,
        {
            "grant_type": "authorization_code",
            "client_id": Config.Google.GOOGLE_CLIENT_ID,
            "client_secret": Config.Google.GOOGLE_CLIENT_SECRET,
            "redirect_uri": Config.Google.GOOGLE_REDIRECT_URL,
            "code": code,
        },
    )
    result.raise_for_status()
    js = result.json()
    result = jwt.decode(js["id_token"], options={"verify_signature": False})
    return result["email"]


def submit_oauth_code_for_messages(code, redirect):
    result = requests.post(
        Config.Google.URL_TOKEN,
        {
            "grant_type": "authorization_code",
            "client_id": Config.Google.GOOGLE_CLIENT_ID,
            "client_secret": Config.Google.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect,
            "code": code,
        },
    )
    result.raise_for_status()
    js = result.json()
    result = jwt.decode(js["id_token"], options={"verify_signature": False})
    return result["email"], js["access_token"], js["refresh_token"]


def refresh_access_token(token):
    result = requests.post(
        Config.Google.URL_TOKEN,
        {
            "grant_type": "refresh_token",
            "client_id": Config.Google.GOOGLE_CLIENT_ID,
            "client_secret": Config.Google.GOOGLE_CLIENT_SECRET,
            "refresh_token": token,
        },
    )
    result.raise_for_status()
    return result.json()["access_token"]


def remote_call(f):
    def g(channel_id, *args, **kwargs):
        (user_id, _, access_token, refresh_token, identity) = fetch_channel_tokens(channel_id)
        try:
            return f(build("gmail", "v1", credentials=Credentials(access_token)), *args, **kwargs)
        except Exception:
            access_token = refresh_access_token(refresh_token)
            create_or_update_channel(user_id, access_token, refresh_token, ChannelType.Google, identity)
            return f(build("gmail", "v1", credentials=Credentials(access_token)), *args, **kwargs)

    return g


@remote_call
def mark_read(service, message):
    label_api = service.users().labels()
    message_api = service.users().messages()

    if not message.group.system:
        labels = label_api.list(userId="me").execute()["labels"]
        label_id = next((e["id"] for e in labels if e["name"] == message.group.name), None)
        if not label_id:
            label_id = label_api.create(
                userId="me",
                body={"labelListVisibility": "labelShow", "messageListVisibility": "show", "name": message.group.name},
            ).execute()["id"]

        message_api.modify(
            userId="me", id=message.external_id, body={"removeLabelIds": "UNREAD", "addLabelIds": label_id}
        ).execute()
    else:
        message_api.modify(userId="me", id=message.external_id, body={"removeLabelIds": "UNREAD"}).execute()
    return


@remote_call
def fetch_messages(service, exclude):
    # Google counts batched calls as individual calls to their api, which counts against the quota.
    # So we return 5 at a time.

    message_api = service.users().messages()
    list_response = message_api.list(userId="me", labelIds=["INBOX"], q="newer_than:2d").execute()
    new_ids = islice((e["id"] for e in list_response["messages"] if e["id"] not in exclude), 0, 5)

    callback = FetchMessageCallback()
    bt = service.new_batch_http_request(callback=callback)
    for id in new_ids:
        bt.add(message_api.get(userId="me", id=id, format="raw"))
    bt.execute()
    return callback.result.values()


class FetchMessageCallback:
    def __init__(self):
        self.result = {}

    def __call__(self, id, resp, exc):
        self.result[id] = ExternalMessage(urlsafe_b64decode(res["raw"]), lambda e: id)
