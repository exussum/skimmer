from skimmer.dal.models import User
from skimmer.db import db


def user_exists(email):
    return db.session.query(User.email).filter(User.email == email).one_or_none()


def add_user(email):
    session = db.session
    session.add(User(email=email))
    session.commit()
