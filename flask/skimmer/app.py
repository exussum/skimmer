from flask import Flask, session, redirect, request, make_response
from flask_cors import CORS
from flask_session import Session

from skimmer.config import Config
from skimmer.api.auth import oauth_token_req, submit_oauth_code
from pymemcache.client.base import Client

app = Flask(__name__)
app.config.update(
    {
        "SECRET_KEY": Config.Flask.FLASK_SECRET_KEY,
        "SESSION_TYPE": "memcached",
        "SESSION_MEMCACHED": Client(Config.Memcached.MEMCACHED_SERVER),
        "SESSION_KEY_PREFIX": Config.Memcached.MEMCACHED_KEY_PREFIX,
        "PERMANENT_SESSION_LIFETIME": Config.Flask.FLASK_PERMANENT_SESSION_LIFETIME,
    }
)

CORS(
    app,
    origins=["http://localhost:8080", "http://localhost:8000"],
    supports_credentials=True,
)
Session(app)


@app.route("/auth/start")
def start():
    session["state"], url = oauth_token_req()
    return {"url": url}


@app.route("/auth/code")
def code():
    state = request.args["state"]
    code = request.args["code"]

    resp = make_response(redirect(Config.React.REACT_HOME_URL))

    if "state" in session and state == session["state"]:
        state = session.pop("state")
        session.clear()
        if False:
            session["email"] = submit_oauth_code(code)
            session.modified = True
            resp.set_cookie("guest", "false")
        else:
            resp.set_cookie("guest", "true")
    else:
        resp.set_cookie("guest", "true")
    return resp


@app.route("/auth/logout")
def logout():
    session.clear()
    return "", 204


@app.route("/auth/whoami")
def whoami():
    if "email" in session:
        return {"email": session["email"]}
    else:
        session.permanent = False
        return {"shrug": "shrug"}


def validate_session(session):
    pass
