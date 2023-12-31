from email.utils import parseaddr

from flask import Blueprint, redirect, request, session
from skimmer.api import auth, channel, flask

bp = Blueprint("channel", __name__)


@bp.route("/add_google")
def add_google():
    session["state"], url = auth.oauth_token_req()
    session["add_google"] = True
    return redirect(url)


@bp.route("/<id>", methods=["DELETE"])
@flask.protect
def delete_channel(user_id, id):
    channel.delete_channel(user_id, id)
    return "", 204


@bp.route("/<id>", methods=["GET"])
@flask.protect
def get_channel(user_id, id):
    return [
        {
            "id": m.id,
            "from": next(e for e in parseaddr(m.sender) if e),
            "sent": m.sent.isoformat(),
            "subject": m.subject,
            "body": m.body,
            "group_id": m.group_id,
        }
        for m in channel.fetch_messages(user_id, id, False)
    ]
