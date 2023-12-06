from collections import namedtuple as nt
from datetime import datetime, timedelta

from skimmer.config import Config
from skimmer.dal.models import ChannelType

ChannelSub = nt("ChannelResult", "id channel_type add_path")

TYPE_TO_PATH = {ChannelType.Google: Config.Channel.CHANNEL_GOOGLE_REDIRECT_URL}

from skimmer.dal.google import fetch_messages as google_fetch_messages
from skimmer.dal.queries import create_or_update_channel, delete_channel, fetch_channel
from skimmer.dal.queries import fetch_channels as fetch_channels_query

_CHANNEL_TYPE_TO_DAL = {ChannelType.Google: google_fetch_messages}
model = nt("model", "id date sender title body")


def fetch_channels(user_id):
    result = {e: None for e in ChannelType}
    result.update({type: id for (id, type) in fetch_channels_query(user_id)})
    return [ChannelSub(v, k.value, TYPE_TO_PATH[k]) for (k, v) in result.items()]


def fetch_messages(user_id, id):
    f = _CHANNEL_TYPE_TO_DAL[fetch_channel(user_id, id).type]
    return [model(*x) for x in f(user_id)]
