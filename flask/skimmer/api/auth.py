import random
import string
from urllib.parse import urlencode, urlsplit, urlunsplit

from skimmer.config import Config
from skimmer.dal.google import submit_oauth_code
from skimmer.dal.queries import add_user, id_for_email

RANDOM_CHARACTERS = string.ascii_lowercase + string.digits


def _random_id():
    generator = random.SystemRandom()
    return "".join(generator.choice(RANDOM_CHARACTERS) for _ in range(32))


def oauth_token_req():
    state = _random_id()
    parts = urlsplit(Config.Google.URL_AUTH)
    params = urlencode(
        (
            ("client_id", Config.Google.GOOGLE_CLIENT_ID),
            ("redirect_uri", Config.Google.GOOGLE_REDIRECT_URL),
            ("response_type", "code"),
            (
                "scope",
                "openid profile email",
            ),
            ("state", state),
            ("prompt", "select_account"),
        )
    )
    return state, urlunsplit(parts[:3] + (params,) + parts[4:])
