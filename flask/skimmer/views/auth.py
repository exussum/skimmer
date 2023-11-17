from flask import session, redirect, request, make_response, Blueprint
import click

from skimmer.config import Config
from skimmer.api.auth import oauth_token_req, submit_oauth_code, user_exists, add_user

bp = Blueprint("auth", __name__)


@bp.route("/start")
def start():
    session["state"], url = oauth_token_req()
    return {"url": url}


@bp.route("/code")
def code():
    state = request.args["state"]
    code = request.args["code"]

    resp = make_response(redirect(Config.React.REACT_HOME_URL))

    if "state" in session and state == session["state"]:
        state = session.pop("state")
        session.clear()
        email = submit_oauth_code(code)
        if user_exists(email):
            session["email"] = email
            session.modified = True
            resp.set_cookie("guest", "false")
        else:
            resp.set_cookie("guest", "true")
    else:
        resp.set_cookie("guest", "true")
    return resp


@bp.route("/logout")
def logout():
    session.clear()
    return "", 204


@bp.route("/whoami")
def whoami():
    if "email" in session:
        return {"email": session["email"]}
    else:
        session.permanent = False
        return {"shrug": "shrug"}


@bp.cli.command("add-email")
@click.argument("email")
def cli_add_user(email):
    add_user(email)
