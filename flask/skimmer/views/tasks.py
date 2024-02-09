from flask import Blueprint, request
from skimmer.api import channel, flask, message

bp = Blueprint("tasks", __name__)


@bp.route("/update_channel", methods=["GET"])
@flask.server_call
def update_channel():
    message.update_messages_from_service(request.args.get("id"))
    return ""


@bp.route("/vacuum_messages", methods=["GET"])
@flask.server_call
def vacuum_messages():
    message.vacuum_messages()
    return ""


@bp.route("/fetch_channel_ids", methods=["GET"])
@flask.server_call
def fetch_channel_ids():
    return list(channel.fetch_channel_ids())
