from email.utils import parseaddr

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


@bp.route("/acknowledge", methods=["POST"])
@flask.protect
def acknowledge(user_id):
    ids = request.form.getlist("message_ids")
    if ids:
        message.hide(user_id, ids)
    return []


@bp.route("/mark_read", methods=["POST"])
@flask.protect
def mark_read(user_id):
    ids = request.form.getlist("message_ids")
    if ids:
        message.hide(user_id, ids)
        message.queue_mark_read(user_id, ids)
    return []


@bp.route("/channel/<channel_id>", methods=["GET"])
@flask.protect
def get_messages(user_id, channel_id):
    return [
        {
            "id": m.id,
            "from": next(e for e in parseaddr(m.sender) if e),
            "sent": m.sent.isoformat(),
            "subject": m.subject,
            "body": m.body,
            "group_id": m.group_id,
        }
        for m in message.fetch(user_id, channel_id, False)
    ]
