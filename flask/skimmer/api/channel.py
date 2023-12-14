from collections import namedtuple as nt
from datetime import datetime, timedelta

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
    fetch_messages,
    message_handler,
)

_TYPE_TO_PATH = {ChannelType.Google: Config.Channel.CHANNEL_GOOGLE_REDIRECT_URL}
_CHANNEL_TYPE_TO_DAL = {ChannelType.Google: google_fetch_messages}

ChannelSub = nt("ChannelResult", "id channel_type add_path")


def create_or_update_channel(user_id, access_token, refresh_token, type):
    channel_id = create_or_update_channel_query(
        user_id, access_token, refresh_token, type
    )
    add_group(user_id, channel_id, SYSTEM_GROUP_GENERAL, True)
    return channel_id


def fetch_channels(user_id):
    result = {e: None for e in ChannelType}
    result.update({type: id for (id, type) in fetch_channels_query(user_id)})
    return [ChannelSub(v, k.value, _TYPE_TO_PATH[k]) for (k, v) in result.items()]


def update_messages_from_service(channel_id):
    channel = fetch_channel(channel_id)
    if channel:
        f = _CHANNEL_TYPE_TO_DAL[channel.type]
        with message_handler(channel.user_id) as mh:
            for (id, sent, sender, subject, body) in f(channel.user_id):
                mh.add(
                    external_id=id,
                    sent=sent,
                    sender=sender,
                    subject=subject,
                    body=body,
                )


def delete_channel(user_id, id):
    delete_messages(user_id, id)
    delete_groups(user_id, id)
    delete_channel_query(user_id, id)
