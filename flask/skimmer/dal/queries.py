from skimmer.dal.models import User
from skimmer.db import db


def email_exists(email):
    return db.session.query(User.email).filter(User.email == email).one_or_none()
