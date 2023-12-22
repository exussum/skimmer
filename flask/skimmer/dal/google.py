import email
import string
from base64 import urlsafe_b64decode
from datetime import datetime
from email import policy, utils

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


def fetch_messages(user_id):
    return _call(_FetchMessages.execute, user_id)


class _FetchMessages:
    def __init__(self):
        self.result = {}

    def __call__(self, id, resp, exc):
        message = email.message_from_bytes(urlsafe_b64decode(resp["raw"]), policy=policy.default)
        sent = utils.parsedate_to_datetime(message.get("date"))
        frm = message.get("from")
        subject = message.get("subject")
        content = next((e for e in message.walk() if e.get_content_type() == "text/plain"), None)

        if message:
            self.result[id] = ExternalMessage(
                resp["id"],
                sent,
                frm,
                subject,
                content.get_content().replace("\r", " ").replace("\n", " ") if content else "",
            )

    @classmethod
    def execute(cls, access_token):
        service = _build_service(access_token)
        message_api = service.users().messages()
        list_response = message_api.list(userId="me", labelIds=["INBOX"], q="newer_than:2d").execute()

        callback = cls()
        bt = service.new_batch_http_request(callback=callback)
        for e in list_response["messages"]:
            bt.add(message_api.get(userId="me", id=e["id"], format="raw"))
        bt.execute()
        return callback.result.values()


def _build_service(token):
    return build("gmail", "v1", credentials=Credentials(token))


def _call(f, id):
    access_token, refresh_token = fetch_channel_tokens(id, ChannelType.Google)
    try:
        return f(access_token)
    except Exception:
        access_token = refresh_access_token(refresh_token)
        create_or_update_channel(id, access_token, refresh_token, ChannelType.Google)
        return f(access_token)
