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
        db.session.query(m.Group.id, m.Group.name, m.Group.system)
        .filter(m.Group.channel_id == channel_id, m.Channel.user_id == user_id)
        .join(m.Channel.groups)
        .all()
    )


def fetch_channel(id):
    return db.session.query(m.Channel).filter(m.Channel.id == id).one_or_none()


def fetch_channels(user_id):
    return list(
        db.session.query(m.Channel.id, m.Channel.type).filter(
            m.Channel.user_id == user_id
        )
    )


def add_group(user_id, channel_id, name, system=False):
    session.add(m.Group(channel_id=channel_id, name=name, system=system))
    session.commit()


def delete_group(user_id, channel_id, id):
    session.execute(
        delete(m.Group).where(
            m.Group.id == id,
            m.Group.system == False,
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
            index_elements=[m.Channel.user_id, m.Channel.type],
            set_={"access_token": access_token, "refresh_token": refresh_token},
        )
        .returning(column("id"))
    )
    result = session.execute(stmt).fetchone()
    id = result[0]
    session.commit()
    return id


def delete_channel(user_id, id):
    session.query(m.Channel).filter(
        m.Channel.user_id == user_id, m.Channel.id == id
    ).delete()
    session.commit()


def delete_messages(user_id, channel_id):
    session.execute(
        delete(m.Message).where(
            m.Group.id == m.Message.group_id,
            m.Group.channel_id == channel_id,
            m.Channel.user_id == user_id,
        )
    )
    session.commit()


def delete_groups(user_id, channel_id):
    session.execute(
        delete(m.Group).where(
            m.Group.channel_id.in_(
                session.query(m.Channel.id)
                .filter(m.Channel.id == channel_id, m.Channel.user_id == user_id)
                .subquery()
            )
        )
    )
    session.commit()


def fetch_channel_tokens(user_id, type):
    return (
        session.query(m.Channel.access_token, m.Channel.refresh_token)
        .filter(m.Channel.user_id == user_id, m.Channel.type == type)
        .one_or_none()
    )


def fetch_messages(user_id, channel_id):
    return (
        session.query(
            m.Message.id,
            m.Message.sent,
            m.Message.sender,
            m.Message.subject,
            m.Message.body,
        )
        .join(m.Message.group)
        .join(m.Group.channel)
        .filter(m.Channel.user_id == user_id, channel_id == m.Channel.id)
        .order_by(m.Message.sent.desc())
    )


class message_handler:
    def __init__(self, user_id):
        self.rows = []
        self.user_id = user_id

    def __enter__(self):
        self.default_group = (
            session.query(m.Group.id)
            .join(m.Group.channel)
            .filter(
                m.Channel.user_id == self.user_id,
                m.Group.name == m.SYSTEM_GROUP_GENERAL,
            )
            .first()[0]
        )
        return self

    def add(self, external_id, subject, sender, body, sent):
        self.rows.append(
            {
                "sender": sender,
                "external_id": external_id,
                "subject": subject,
                "body": body,
                "sent": sent,
                "group_id": self.default_group,
            }
        )

    def __exit__(self, *args, **kwargs):
        ids = set(
            (
                e[0]
                for e in session.query(m.Message.external_id)
                .join(m.Message.group)
                .join(m.Group.channel)
                .filter(
                    m.Message.external_id.in_(
                        (e["external_id"] for e in self.rows),
                    ),
                    m.Channel.user_id == self.user_id,
                )
            )
        )
        self.rows = [e for e in self.rows if e["external_id"] not in ids]
        if self.rows:
            session.execute(insert(m.Message), self.rows)
            session.commit()
