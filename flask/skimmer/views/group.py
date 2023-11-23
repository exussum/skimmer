from flask import Blueprint, make_response, request, session

bp = Blueprint("group", __name__)

groups = [
    {
        "id": 1,
        "name": "alice",
    },
    {
        "id": 2,
        "name": "bob",
    },
]

id = 3


@bp.route("/", methods=["GET"])
def fetch_groups():
    return groups


@bp.route("/", methods=["POST"])
def add_group():
    global id
    id += 1
    groups.append({"id": id, "name": request.form.get("name")})
    return "", 204


@bp.route("/<id>", methods=["DELETE"])
def delete_group(id):
    global groups
    groups = [e for e in groups if e["id"] != int(id)]
    return "", 204
