import click

from flask import Blueprint, make_response, redirect, request, session, url_for
from skimmer.api.auth import add_user, id_for_email, oauth_token_req, submit_oauth_code
from skimmer.api.channel import fetch_channels
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
        state = session.get("state")
        add_google = session.get("add_google")
        session.clear()

        email = submit_oauth_code(code)

        if id := id_for_email(email):
            session["email"] = email
            session["user_id"] = id
            session.permanent = True
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
    if "user_id" in session:
        channels = fetch_channels(session["user_id"])
        return {
            "email": session["email"],
            "channels": [
                {"identity": e.identity, "channel_type": e.channel_type, "id": e.id, "add_path": e.add_path}
                for e in channels
            ],
        }
    else:
        session.permanent = False
        return {}


@bp.cli.command("add-email")
@click.argument("email")
def cli_add_user(email):
    add_user(email)
