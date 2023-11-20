from flask import Blueprint
from babel.messages.pofile import read_po

bp = Blueprint("i18n", __name__)

@bp.route("/get")
def get():
    with open("/app/i18n/en_US.po") as fh:
        translation = {}
        cat = read_po(fh, abort_invalid=True)
        for e in cat:
            if e.id:
               translation[e.id] = e.string
        return translation
        
