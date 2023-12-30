from flask import Blueprint, request
from skimmer.api import flask, message

bp = Blueprint("message", __name__)


@bp.route("/group/<group_id>", methods=["POST"])
@flask.protect
def set_group(user_id, group_id):
    ids = request.form.getlist("message_ids")
    if ids:
        message.set_group(user_id, group_id, ids)
    return []


@bp.route("/hide", methods=["POST"])
@flask.protect
def hide(user_id):
    ids = request.form.getlist("message_ids")
    if ids:
        message.hide_messages(user_id, ids)
    return []
