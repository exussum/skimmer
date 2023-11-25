from flask import Blueprint, redirect, request, session
from skimmer.api import auth, channel, flask

bp = Blueprint("channel", __name__)


@bp.route("/add_google")
def start():
    session["state"], url = auth.oauth_token_req()
    session["add_google"] = True
    return redirect(url)


@bp.route("/<id>", methods=["DELETE"])
@flask.protect
def delete_channel(user_id, id):
    channel.delete_channel(user_id, id)
    return "", 204
