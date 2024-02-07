import re

from skimmer.api.http import build_url
from skimmer.config import Config
from skimmer.dal import google
from skimmer.dal.models import ChannelType

MESSAGE_LINKEDIN_RE = re.compile(r"", re.MULTILINE)


class GoogleChannel:
    fetch_messages = google.fetch_messages
    _redirect_url = build_url(Config.Flask.FLASK_CHANNEL_URL + "/code", type=ChannelType.Google.value)

    @staticmethod
    def auth_url():
        return build_url(
            Config.Google.URL_AUTH,
            client_id=Config.Google.GOOGLE_CLIENT_ID,
            redirect_uri=GoogleChannel._redirect_url,
            response_type="code",
            scope="openid profile email https://www.googleapis.com/auth/gmail.readonly",
            access_type="offline",
            prompt="consent",
        )

    @staticmethod
    def submit_code(code):
        return google.submit_oauth_code_for_messages(code, GoogleChannel._redirect_url)


def linkedin(message):
    return " ".join(message.split("\n")[5:]) if "InMail: You have a new message" in message else message


DOMAIN_TO_SANITISER = {"linkedin.com": linkedin}
TYPE_TO_CHANNEL = {ChannelType.Google.value: GoogleChannel}
