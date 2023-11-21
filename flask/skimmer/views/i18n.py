from babel.messages.pofile import read_po

from flask import Blueprint
from skimmer.dal import i18n

bp = Blueprint("i18n", __name__)


@bp.route("/get")
def get():
    with i18n.get_translation() as fh:
        translation = {}
        cat = read_po(fh, abort_invalid=True)
        for e in cat:
            if e.id:
                translation[e.id] = e.string
        return translation
