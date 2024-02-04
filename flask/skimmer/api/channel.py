import logging
from collections import namedtuple as nt
from datetime import datetime, timedelta
from urllib.parse import urlencode, urlsplit, urlunsplit

from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.metrics import accuracy_score
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from skimmer.config import Config
from skimmer.dal import google
from skimmer.dal.models import SYSTEM_GROUP_GENERAL, ChannelType
from skimmer.dal.queries import (
    add_group,
    bulk_message_handler,
    create_or_update_channel as create_or_update_channel_query,
    delete_channel as delete_channel_query,
    delete_groups,
    delete_messages,
    fetch_channel,
    fetch_channels as fetch_channels_query,
    fetch_groups,
    fetch_messages,
)

ChannelSub = nt("ChannelResult", "id channel_type identity add_path")


def _build_url(base, **params):
    parts = urlsplit(base)
    return urlunsplit(parts[:3] + (urlencode(tuple(params.items())),) + parts[4:])


class GoogleChannel:
    fetch_messages = google.fetch_messages
    _redirect_url = _build_url(Config.Flask.FLASK_CHANNEL_URL + "/code", type=ChannelType.Google.value)

    @staticmethod
    def auth_url():
        return _build_url(
            Config.Google.URL_AUTH,
            client_id=Config.Google.GOOGLE_CLIENT_ID,
            redirect_uri=GoogleChannel._redirect_url,
            response_type="code",
            scope="openid profile email https://www.googleapis.com/auth/gmail.readonly",
            access_type="offline",
            prompt="consent",
        )

    @staticmethod
    def submit_code(code):
        return google.submit_oauth_code_for_messages(code, GoogleChannel._redirect_url)


_TYPE_TO_CHANNEL = {ChannelType.Google.value: GoogleChannel}


def auth_url(type):
    return _TYPE_TO_CHANNEL[type].auth_url()


def submit_code(user_id, type, code):
    email, access_token, refresh_token = _TYPE_TO_CHANNEL[type].submit_code(code)
    channel_id = create_or_update_channel_query(user_id, access_token, refresh_token, type, email)
    add_group(user_id, channel_id, SYSTEM_GROUP_GENERAL, True)
    return channel_id


def fetch_channels(user_id):
    channels = fetch_channels_query(user_id)
    builder = lambda e: _build_url(Config.Flask.FLASK_CHANNEL_URL + "/start", type=e.value)
    return [ChannelSub(id, type.value, identity, builder(type)) for (id, type, identity) in channels] + [
        ChannelSub(None, e.value, None, builder(e)) for e in ChannelType
    ]


def predict(old_messages, new_messages):
    pipeline = Pipeline([("vect", CountVectorizer()), ("tdiff", TfidfTransformer()), ("class", MultinomialNB())])
    corpus = [f"{e.sender} {e.subject} {e.body}" for e in old_messages]
    labels = [e.group_id for e in old_messages]
    incoming = [f"{e.sender} {e.subject} {e.body}" for e in new_messages]
    pipeline.fit(corpus, labels)
    predictions = pipeline.predict(incoming)
    return [e.item() for e in predictions]


def update_messages_from_service(channel_id):
    channel = fetch_channel(channel_id)
    default_group = next(e for e in fetch_groups(channel.user_id, channel.id) if e.name == SYSTEM_GROUP_GENERAL)

    if not (channel and default_group):
        return

    local_messages = list(fetch_messages(channel.user_id, channel.id, True))
    remote_messages = list(_TYPE_TO_CHANNEL[channel.type.value].fetch_messages(channel_id))

    local_ids = set(e.external_id for e in local_messages)
    remote_ids = set(e.id for e in remote_messages)

    new_messages = [e for e in remote_messages if e.id not in local_ids]

    if new_messages:
        group_ids = predict(local_messages, new_messages) if local_messages else [default_group.id] * len(new_messages)

        with bulk_message_handler(channel.user_id) as mh:
            for message, group_id in zip(new_messages, group_ids):
                mh.add(
                    external_id=message.id,
                    sent=message.sent,
                    sender=message.sender,
                    subject=message.subject,
                    body=message.body,
                    group_id=group_id,
                )


def delete_channel(user_id, id):
    delete_messages(user_id, id)
    delete_groups(user_id, id)
    delete_channel_query(user_id, id)
