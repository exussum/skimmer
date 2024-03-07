from collections import namedtuple as nt
from functools import reduce

from sqlalchemy import column, delete, func, select, text, update
from sqlalchemy.dialects.postgresql import insert

from skimmer.dal import models as m
from skimmer.db import db

session = db.session

Message = nt("Message", "id  sent  sender  subject  body  group_id external_id")
ChannelStats = nt("ChannelStats", "id type messages messages_per_group")
Stats = nt("Stats", "last_message_id channel_stats")


def get_stats(user_id, last_id):
    counts_by_channel_id = (
        reduce(
            _stats_query_to_records,
            db.session.query(m.Channel.id, m.Channel.type, m.Group.name, func.count(m.Message.group_id))
            .join(m.Group.messages)
            .join(m.Group.channel)
            .filter(
                m.Message.id > last_id, m.Channel.user_id == user_id, m.Group.system == False, m.Message.hidden == False
            )
            .group_by(m.Channel.id, m.Group.name, m.Group.channel_id)
            .all(),
            {},
        )
        if last_id
        else {}
    )

    last_message_id = (
        db.session.query(func.max(m.Message.id))
        .join(m.Message.group)
        .join(m.Group.channel)
        .filter(m.Channel.user_id == user_id)
    ).first()
    last_message_id = last_message_id[0] if last_message_id else 0
    return Stats(last_message_id, list(counts_by_channel_id.values()))


def id_for_email(email):
    result = session.query(m.User.id).filter(m.User.email == email).one_or_none()
    if result:
        return result[0]


def _fetch_valid_message_ids(user_id, ids):
    query = (
        (session.query(m.Message.id).filter(m.Message.id.in_(ids), m.Channel.user_id == user_id))
        .join(m.Message.group)
        .join(m.Group.channel)
    )
    return [e[0] for e in query]


def hide_messages(user_id, message_ids):
    message_ids = _fetch_valid_message_ids(user_id, message_ids)

    if message_ids:
        session.execute(update(m.Message).where(m.Message.id.in_(message_ids)).values(hidden=True))
        session.commit()


def set_group(user_id, group_id, message_ids):
    group_id = (
        session.query(m.Group.id)
        .filter(
            m.Group.id == group_id,
            m.Channel.user_id == user_id,
        )
        .join(m.Channel.groups)
        .one_or_none()
    )
    message_ids = _fetch_valid_message_ids(user_id, message_ids)

    if group_id and message_ids:
        session.execute(update(m.Message).where(m.Message.id.in_(message_ids)).values(group_id=group_id[0]))
        session.commit()


def add_user(email):
    user = m.User(email=email)
    session.add(user)
    session.commit()
    return user.id


def fetch_groups(user_id, channel_id):
    return list(
        session.query(m.Group.id, m.Group.name, m.Group.system)
        .filter(m.Group.channel_id == channel_id, m.Channel.user_id == user_id)
        .join(m.Channel.groups)
        .all()
    )


def fetch_channel(id):
    return session.query(m.Channel).filter(m.Channel.id == id).one_or_none()


def fetch_channels(user_id):
    return list(
        session.query(m.Channel.id, m.Channel.type, m.Channel.identity)
        .filter(m.Channel.user_id == user_id)
        .order_by(m.Channel.type, m.Channel.identity)
    )


def vacuum_messages():
    queries = [
        "UPDATE message SET hidden = true WHERE sent < current_date - interval '1' day",
        """
        DELETE FROM message
        WHERE message.group_id NOT IN (SELECT id FROM "group" WHERE system = true) AND
              hidden = true AND
              sent < current_date - interval '90' day
    """,
    ]

    for q in queries:
        session.execute(text(q))
    session.commit()


def fetch_channel_ids():
    return [e[0] for e in session.query(m.Channel.id)]


def add_group(user_id, channel_id, name, system=False):
    stmt = (
        insert(m.Group)
        .values(
            channel_id=channel_id,
            name=name,
            system=system,
        )
        .on_conflict_do_nothing(
            index_elements=[m.Group.name, m.Group.channel_id],
        )
    )
    session.execute(stmt)
    session.commit()


def delete_group(user_id, channel_id, id):
    session.execute(
        delete(m.Group).where(
            m.Group.id == id,
            m.Group.system == False,
            m.Group.channel_id
            == select(m.Channel.id).where(m.Channel.id == channel_id, m.Channel.user_id == user_id).scalar_subquery(),
        )
    )
    session.commit()


def create_or_update_channel(user_id, access_token, refresh_token, type, identity):
    stmt = (
        insert(m.Channel)
        .values(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id,
            type=type,
            identity=identity,
        )
        .on_conflict_do_update(
            index_elements=[m.Channel.user_id, m.Channel.type, m.Channel.identity],
            set_={"access_token": access_token, "refresh_token": refresh_token},
        )
        .returning(column("id"))
    )
    result = session.execute(stmt).fetchone()
    id = result[0]
    session.commit()
    return id


def delete_channel(user_id, id):
    session.query(m.Channel).filter(m.Channel.user_id == user_id, m.Channel.id == id).delete()
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
                session.query(m.Channel.id).filter(m.Channel.id == channel_id, m.Channel.user_id == user_id).subquery()
            )
        )
    )
    session.commit()


def fetch_channel_tokens(channel_id):
    return (
        session.query(
            m.Channel.user_id, m.User.email, m.Channel.access_token, m.Channel.refresh_token, m.Channel.identity
        )
        .join(m.Channel.user)
        .filter(m.Channel.id == channel_id)
        .one_or_none()
    )


def fetch_messages(user_id, channel_id, include_hidden):
    result = (
        session.query(
            m.Message.id,
            m.Message.sent,
            m.Message.sender,
            m.Message.subject,
            m.Message.body,
            m.Message.group_id,
            m.Message.external_id,
        )
        .join(m.Message.group)
        .join(m.Group.channel)
        .filter(m.Channel.user_id == user_id, channel_id == m.Channel.id)
    )
    if not include_hidden:
        result = result.filter(m.Message.hidden == False)

    return (Message(*e) for e in result.order_by(m.Message.sent.desc()))


def fetch_message(user_id, message_id):
    result = (
        session.query(m.Message)
        .join(m.Message.group)
        .join(m.Group.channel)
        .filter(m.Channel.user_id == user_id, m.Message.id == message_id)
    )
    return result.first()


class bulk_message_handler:
    def __init__(self, user_id):
        self.rows = []
        self.user_id = user_id

    def __enter__(self):
        return self

    def add(self, external_id, subject, sender, body, sent, group_id):
        self.rows.append(
            {
                "sender": sender,
                "external_id": external_id,
                "subject": subject,
                "body": body,
                "sent": sent,
                "group_id": group_id,
                "hidden": False,
            }
        )

    def __exit__(self, *args, **kwargs):
        session.execute(insert(m.Message), self.rows)
        session.commit()


def _stats_query_to_records(m, e):
    x = m.get(e.id)
    if not x:
        m[e[0]] = ChannelStats(e[0], e[1], e[3], {e[2]: e[3]})
    else:
        x.messages_per_group[e[2]] = e[3]
        m[e.id] = x._replace(messages=x.messages + e[3])
    return m
