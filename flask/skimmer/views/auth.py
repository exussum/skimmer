from flask import session, redirect, request, make_response, Blueprint

from skimmer.config import Config
from skimmer.api.auth import oauth_token_req, submit_oauth_code, email_exists

auth = Blueprint("auth", __name__)


@auth.route("/start")
def start():
    session["state"], url = oauth_token_req()
    return {"url": url}


@auth.route("/code")
def code():
    state = request.args["state"]
    code = request.args["code"]

    resp = make_response(redirect(Config.React.REACT_HOME_URL))

    if "state" in session and state == session["state"]:
        state = session.pop("state")
        session.clear()
        email = submit_oauth_code(code)
        if email_exists(email):
            session["email"] = email
            session.modified = True
            resp.set_cookie("guest", "false")
        else:
            resp.set_cookie("guest", "true")
    else:
        resp.set_cookie("guest", "true")
    return resp


@auth.route("/logout")
def logout():
    session.clear()
    return "", 204


@auth.route("/whoami")
def whoami():
    if "email" in session:
        return {"email": session["email"]}
    else:
        session.permanent = False
        return {"shrug": "shrug"}
