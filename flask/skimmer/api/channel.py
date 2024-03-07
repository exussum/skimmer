import logging
from collections import namedtuple as nt
from datetime import datetime, timedelta

from skimmer.api.http import build_url
from skimmer.api.integration import TYPE_TO_CHANNEL
from skimmer.config import Config
from skimmer.dal.models import SYSTEM_GROUP_GENERAL, ChannelType
from skimmer.dal.queries import (
    add_group,
    create_or_update_channel as create_or_update_channel_query,
    delete_channel as delete_channel_query,
    delete_groups,
    delete_messages,
    fetch_channel_ids,
    fetch_channels as fetch_channels_query,
    get_stats,
)

ChannelSub = nt("ChannelResult", "id channel_type identity add_path")


def auth_url(type):
    return TYPE_TO_CHANNEL[type].auth_url()


def submit_code(user_id, type, code):
    email, access_token, refresh_token = TYPE_TO_CHANNEL[type].submit_code(code)
    channel_id = create_or_update_channel_query(user_id, access_token, refresh_token, type, email)
    add_group(user_id, channel_id, SYSTEM_GROUP_GENERAL, True)
    return channel_id


def fetch_channels(user_id):
    channels = fetch_channels_query(user_id)
    builder = lambda e: build_url(Config.Flask.FLASK_CHANNEL_URL + "/start", type=e.name)
    return [ChannelSub(id, type.value, identity, builder(type)) for (id, type, identity) in channels] + [
        ChannelSub(None, e.value, None, builder(e)) for e in ChannelType
    ]


def delete_channel(user_id, id):
    delete_messages(user_id, id)
    delete_groups(user_id, id)
    delete_channel_query(user_id, id)
