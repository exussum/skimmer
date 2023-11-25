import string

import jwt
import requests

from skimmer.config import Config

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
    return result["email"], js["access_token"]
