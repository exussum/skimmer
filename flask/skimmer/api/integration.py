import re

from skimmer.api.http import build_url
from skimmer.config import Config
from skimmer.dal import google, imap
from skimmer.dal.models import ChannelType

MESSAGE_LINKEDIN_RE = re.compile(r"", re.MULTILINE)


class GoogleImapChannel:
    fetch_messages = imap.fetch_messages
    mark_read = imap.mark_read

    _redirect_url = build_url(Config.Flask.FLASK_CHANNEL_URL + "/code", type=ChannelType.GoogleImap.name)

    @staticmethod
    def auth_url():
        return build_url(
            Config.Google.URL_AUTH,
            client_id=Config.Google.GOOGLE_CLIENT_ID,
            redirect_uri=GoogleImapChannel._redirect_url,
            response_type="code",
            scope="email https://mail.google.com/",
            access_type="offline",
            prompt="consent",
        )

    @staticmethod
    def submit_code(code):
        return google.submit_oauth_code_for_messages(code, GoogleImapChannel._redirect_url)


class GoogleChannel:
    fetch_messages = google.fetch_messages
    mark_read = google.mark_read

    _redirect_url = build_url(Config.Flask.FLASK_CHANNEL_URL + "/code", type=ChannelType.Google.name)

    @staticmethod
    def auth_url():
        return build_url(
            Config.Google.URL_AUTH,
            client_id=Config.Google.GOOGLE_CLIENT_ID,
            redirect_uri=GoogleChannel._redirect_url,
            response_type="code",
            scope="openid profile email https://www.googleapis.com/auth/gmail.modify",
            access_type="offline",
            prompt="consent",
        )

    @staticmethod
    def submit_code(code):
        return google.submit_oauth_code_for_messages(code, GoogleChannel._redirect_url)


def linkedin(message):
    if "InMail: You have a new message" in message:
        return " ".join(message.split("\n")[5:])
    elif "replied to your comment" in message:
        return " ".join(message.split("\n")[2:])
    return message


DOMAIN_TO_SANITISER = {"linkedin.com": linkedin}
TYPE_TO_CHANNEL = {ChannelType.Google.name: GoogleChannel, ChannelType.GoogleImap.name: GoogleImapChannel}
