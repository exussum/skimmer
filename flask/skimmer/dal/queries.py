from sqlalchemy import column, delete, select
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
        db.session.query(m.Group.id, m.Group.name)
        .filter(m.Group.channel_id == channel_id, m.Channel.user_id == user_id)
        .join(m.Channel.groups)
        .all()
    )


def fetch_channel(user_id, id):
    return (
        db.session.query(m.Channel)
        .filter(m.Channel.user_id == user_id, m.Channel.id == id)
        .one_or_none()
    )


def fetch_channels(user_id):
    return list(
        db.session.query(m.Channel.id, m.Channel.type).filter(
            m.Channel.user_id == user_id
        )
    )


def add_group(user_id, channel_id, name):
    session.add(m.Group(channel_id=channel_id, name=name))
    session.commit()


def delete_group(user_id, channel_id, id):
    session.execute(
        delete(m.Group).where(
            m.Group.id == id,
            m.Group.channel_id
            == select(m.Channel.id)
            .where(m.Channel.id == channel_id, m.Channel.user_id == user_id)
            .scalar_subquery(),
        )
    )
    session.commit()


def create_or_update_channel(user_id, access_token, refresh_token, type):
    stmt = (
        insert(m.Channel)
        .values(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id,
            type=type,
        )
        .on_conflict_do_update(
            index_elements=["user_id", "type"],
            set_={"access_token": access_token, "refresh_token": refresh_token},
        )
        .returning(column("id"))
    )
    result = session.execute(stmt).fetchone()
    id = result[0]
    session.commit()
    return id


def delete_channel(user_id, id):
    session.execute(
        delete(m.Group).where(
            m.Group.channel_id
            == select(m.Channel.id)
            .where(m.Channel.id == id, m.Channel.user_id == user_id)
            .scalar_subquery()
        )
    )
    session.execute(
        delete(m.Channel).where(m.Channel.id == id, m.Channel.user_id == user_id)
    )
    session.commit()


def fetch_channel_tokens(user_id, type):
    return (
        session.query(m.Channel.access_token, m.Channel.refresh_token)
        .filter(m.Channel.user_id == user_id, m.Channel.type == type)
        .one_or_none()
    )
