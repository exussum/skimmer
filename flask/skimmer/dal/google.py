import email
import string
import sys
from base64 import urlsafe_b64decode
from datetime import datetime
from email import policy, utils
from itertools import islice

import jwt
import requests
from bs4 import BeautifulSoup
from bs4.element import Comment
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
        (user_id, access_token, refresh_token, identity) = fetch_channel_tokens(channel_id)
        try:
            return f(build("gmail", "v1", credentials=Credentials(access_token)), *args, **kwargs)
        except Exception:
            access_token = refresh_access_token(refresh_token)
            create_or_update_channel(user_id, access_token, refresh_token, ChannelType.Google, identity)
            return f(build("gmail", "v1", credentials=Credentials(access_token)), *args, **kwargs)

    return g


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
        message = email.message_from_bytes(urlsafe_b64decode(resp["raw"]), policy=policy.default)
        sent = utils.parsedate_to_datetime(message.get("date"))
        frm = message.get("from")
        subject = message.get("subject")
        text_content = next((e for e in message.walk() if e.get_content_type() == "text/plain"), None)
        html_content = next((e for e in message.walk() if e.get_content_type() == "text/html"), None)

        self.result[id] = ExternalMessage(
            resp["id"],
            sent,
            frm,
            subject,
            (text_content and text_content.get_content().strip())
            or (html_content and strip_html(html_content.get_content()))
            or "",
        )


def _tag_visible(element):
    return (not element.parent.name in ["style", "script", "head", "title", "meta", "[document]"]) and (
        not isinstance(element, Comment)
    )


def strip_html(body):
    soup = BeautifulSoup(body, "html.parser")
    texts = soup.findAll(text=True)
    visible_texts = filter(_tag_visible, texts)
    return " ".join(t.strip() for t in filter(_tag_visible, texts)).replace("\r", " ").replace("\n", " ")
