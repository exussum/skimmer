from flask import Blueprint, make_response, request, session
from skimmer.api import flask, group

bp = Blueprint("group", __name__)


@bp.route("/<channel_id>", methods=["GET"])
@flask.protect
def fetch_groups(user_id, channel_id):
    return [
        {"id": id, "name": name, "system": system} for (id, name, system) in group.fetch_groups(user_id, channel_id)
    ]


@bp.route("/<channel_id>", methods=["POST"])
@flask.protect
def add_group(user_id, channel_id):
    group.add_group(user_id, channel_id, request.form.get("name"))
    return "", 204


@bp.route("/<channel_id>/<id>", methods=["DELETE"])
@flask.protect
def delete_group(user_id, channel_id, id):
    group.delete_group(user_id, channel_id, id)
    return "", 204
