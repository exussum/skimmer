from flask import Flask, session, redirect, request
import jwt
import requests
from urllib.parse import urlunsplit, urlencode, urlsplit
import random
import string
from flask_cors import CORS

from skimmer.config import Config


app = Flask(__name__)
app.secret_key = Config.Flask.SECRET_KEY
CORS(app, origins=["http://localhost:8080", "http://localhost:8000"], supports_credentials=True)

RANDOM_CHARACTERS = string.ascii_lowercase + string.digits


def random_id():
    generator = random.SystemRandom()
    return "".join(generator.choice(RANDOM_CHARACTERS) for _ in range(32))


@app.route("/auth/start")
def start():
    session["state"] = random_id()
    parts = urlsplit(Config.Google.URL_AUTH)
    params = urlencode(
        (
            ("client_id", Config.Google.GOOGLE_CLIENT_ID),
            ("redirect_uri", Config.Google.GOOGLE_REDIRECT_URL),
            ("response_type", "code"),
            ("scope", "openid profile email"),
            ("state", session["state"]),
        )
    )
    return {"url": urlunsplit(parts[:3] + (params,) + parts[4:])}


@app.route("/auth/code")
def code():
    state = request.args["state"]
    code = request.args["code"]

    if "state" in session and state == session["state"]:
        state = session.pop("state")
        session.clear()

        result = requests.post(
            Config.Google.URL_TOKEN,
            {
                "grant_type": "authorization_code",
                "client_id": Config.Google.GOOGLE_CLIENT_ID,
                "client_secret": Config.Google.GOOGLE_CLIENT_SECRET,
                "redirect_uri": Config.Google.GOOGLE_REDIRECT_URL,
                "code": request.args["code"],
            },
        )
        result.raise_for_status()
        js = result.json()
        session["email"] = jwt.decode(
            js["id_token"], options={"verify_signature": False}
        )["email"]

    session.modified = True
    return redirect(Config.React.REACT_HOME_URL)


@app.route("/auth/logout")
def logout():
    session.clear()
    return "", 204


@app.route("/auth/whoami")
def whoami():
    if "email" in session:
        return {"email": session["email"]}
    else:
        return {"shrug": "shrug"}


def validate_session(session):
    pass
