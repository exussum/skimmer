from sqlalchemy import column
from sqlalchemy.dialects.postgresql import insert

from skimmer.dal import models as m
from skimmer.db import db

session = db.session


def id_for_email(email):
    result = db.session.query(m.User.id).filter(m.User.email == email).one_or_none()
    if result:
        return result[0]


def add_user(email):
    user = m.User(email=email)
    session.add(user)
    session.commit()
    return user.id


def fetch_groups(user_id, channel_id):
    return list(
        db.session.query(m.Channel.id, m.Channel.type, m.Group.id, m.Group.name)
        .filter(m.Group.channel_id == channel_id, m.Channel.user_id == user_id)
        .join(m.Channel.groups)
        .all()
    )


def add_group(user_id, channel_id, name):
    session.add(m.Group(channel_id=channel_id, name=name))
    session.commit()


def delete_group(user_id, channel_id, id):
    session.query(m.Group).filter(
        m.Group.channel_id == channel_id, m.Group.id == id
    ).delete()
    session.commit()


def create_or_update_channel(user_id, key, type):
    stmt = (
        insert(m.Channel)
        .values(key=key, user_id=user_id, type=type)
        .on_conflict_do_update(index_elements=["user_id", "type"], set_={"key": key})
        .returning(column("id"))
    )
    result = session.execute(stmt).fetchone()
    id = result[0]
    session.commit()
    return id
