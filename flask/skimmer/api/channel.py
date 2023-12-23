import logging
from collections import namedtuple as nt
from datetime import datetime, timedelta

from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.metrics import accuracy_score
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from skimmer.config import Config
from skimmer.dal.google import fetch_messages as google_fetch_messages
from skimmer.dal.models import SYSTEM_GROUP_GENERAL, ChannelType
from skimmer.dal.queries import (
    add_group,
    create_or_update_channel as create_or_update_channel_query,
    delete_channel as delete_channel_query,
    delete_groups,
    delete_messages,
    fetch_channel,
    fetch_channels as fetch_channels_query,
    fetch_groups,
    fetch_messages,
    message_handler,
)

logger = logging.getLogger(__name__)

_TYPE_TO_PATH = {ChannelType.Google: Config.Channel.CHANNEL_GOOGLE_REDIRECT_URL}
_CHANNEL_TYPE_TO_DAL = {ChannelType.Google: google_fetch_messages}

ChannelSub = nt("ChannelResult", "id channel_type add_path")


def create_or_update_channel(user_id, access_token, refresh_token, type):
    channel_id = create_or_update_channel_query(user_id, access_token, refresh_token, type)
    add_group(user_id, channel_id, SYSTEM_GROUP_GENERAL, True)
    return channel_id


def fetch_channels(user_id):
    result = {e: None for e in ChannelType}
    result.update({type: id for (id, type) in fetch_channels_query(user_id)})
    return [ChannelSub(v, k.value, _TYPE_TO_PATH[k]) for (k, v) in result.items()]


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
    remote_messages = list(_CHANNEL_TYPE_TO_DAL[channel.type](channel.user_id))

    local_ids = set(e.external_id for e in local_messages)
    remote_ids = set(e.id for e in remote_messages)

    new_messages = [e for e in remote_messages if e.id not in local_ids]

    if new_messages:
        group_ids = predict(local_messages, new_messages) if local_messages else [default_group.id] * len(new_messages)

        with message_handler(channel.user_id) as mh:
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
