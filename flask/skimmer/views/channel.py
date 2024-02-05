from email.utils import parseaddr

from flask import Blueprint, redirect, request, session
from skimmer.api import auth, channel, flask
from skimmer.config import Config

bp = Blueprint("channel", __name__)


@bp.route("/start")
@flask.protect
def start(user_id):
    return redirect(channel.auth_url(request.args.get("type")))


@bp.route("/code")
@flask.protect
def code(user_id):
    channel.submit_code(user_id, request.args.get("type"), request.args.get("code"))
    return redirect(Config.React.REACT_HOME_URL)


@bp.route("/<id>", methods=["DELETE"])
@flask.protect
def delete_channel(user_id, id):
    channel.delete_channel(user_id, id)
    return "", 204


@bp.route("/stats", methods=["GET"])
@flask.protect
def stats(user_id):
    last_message_id = request.args.get("last_message_id")
    result = channel.get_stats(user_id, last_message_id)
    return {
        "last_message_id": result.last_message_id,
        "channel_stats": [
            {"id": e.id, "messages": e.messages, "messages_per_group": e.messages_per_group}
            for e in result.channel_stats
        ],
    }


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
