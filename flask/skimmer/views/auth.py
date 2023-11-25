import click

from flask import Blueprint, make_response, redirect, request, session
from skimmer.api.auth import add_user, id_for_email, oauth_token_req, submit_oauth_code
from skimmer.api.group import ChannelType, create_or_update_channel
from skimmer.config import Config

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
        email, key = submit_oauth_code(code)
        import sys

        if id := id_for_email(email):
            create_or_update_channel(id, key, ChannelType.Google)
            session["email"] = email
            session["user_id"] = id
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
