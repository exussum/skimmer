from email.utils import parseaddr

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.metrics import accuracy_score
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from skimmer.api.integration import DOMAIN_TO_SANITISER, TYPE_TO_CHANNEL
from skimmer.dal.models import SYSTEM_GROUP_GENERAL
from skimmer.dal.queries import (
    bulk_message_handler,
    fetch_channel,
    fetch_groups,
    fetch_message,
    fetch_messages as fetch,
    get_stats,
    hide_messages as hide,
    set_group,
    vacuum_messages,
)
from skimmer.dal.rmq import queue_mark_read


def predict(old_messages, new_messages):
    pipeline = Pipeline([("vect", CountVectorizer()), ("tdiff", TfidfTransformer()), ("class", MultinomialNB())])
    corpus = [f"{e.sender} {e.subject} {e.body}" for e in old_messages]
    labels = [e.group_id for e in old_messages]
    incoming = [f"{e.sender} {e.subject} {e.body}" for e in new_messages]
    pipeline.fit(corpus, labels)
    predictions = pipeline.predict(incoming)
    print(np.mean(pipeline.predict(corpus) == labels))
    return [e.item() for e in predictions]


def update_messages_from_service(channel_id):
    channel = fetch_channel(channel_id)
    default_group = next(e for e in fetch_groups(channel.user_id, channel.id) if e.name == SYSTEM_GROUP_GENERAL)

    if not (channel and default_group):
        return

    local_messages = list(fetch(channel.user_id, channel.id, True))
    local_ids = set(e.external_id for e in local_messages)

    remote_messages = list(TYPE_TO_CHANNEL[channel.type.value].fetch_messages(channel_id, local_ids))
    remote_ids = set(e.id for e in remote_messages)

    new_messages = [e for e in remote_messages if e.id not in local_ids]

    _persist_messages(channel, default_group, new_messages, local_messages)


def mark_read(user_id, message_id):
    message = fetch_message(user_id, message_id)
    if message:
        TYPE_TO_CHANNEL[message.group.channel.type.value].mark_read(message.group.channel.id, message)


def _persist_messages(channel, default_group, new_messages, local_messages):
    if new_messages:
        group_ids = predict(local_messages, new_messages) if local_messages else [default_group.id] * len(new_messages)

        with bulk_message_handler(channel.user_id) as mh:
            for message, group_id in zip(new_messages, group_ids):
                domain = parseaddr(message.sender)[1].split("@")
                domain = domain[1] if len(domain) > 0 else domain
                body = DOMAIN_TO_SANITISER.get(domain, lambda e: e)(message.body)
                mh.add(
                    external_id=message.id,
                    sent=message.sent,
                    sender=message.sender,
                    subject=message.subject,
                    body=body,
                    group_id=group_id,
                )
