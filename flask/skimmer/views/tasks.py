from flask import Blueprint, request
from skimmer.api import flask
from skimmer.api.channel import update_messages_from_service

bp = Blueprint("tasks", __name__)


@bp.route("/update_channel", methods=["GET"])
@flask.server_call
def update_channel():
    update_messages_from_service(request.args.get("id"))
    return {}
