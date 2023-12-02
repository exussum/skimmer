from collections import namedtuple as nt
from datetime import datetime, timedelta

from skimmer.config import Config
from skimmer.dal.models import ChannelType

ChannelSub = nt("ChannelResult", "id channel_type add_path")

TYPE_TO_PATH = {ChannelType.Google: Config.Channel.CHANNEL_GOOGLE_REDIRECT_URL}

from skimmer.dal.queries import create_or_update_channel, delete_channel
from skimmer.dal.queries import fetch_channels as fetch_channels_query


def fetch_channels(user_id):
    result = {e: None for e in ChannelType}
    result.update({type: id for (id, type) in fetch_channels_query(user_id)})
    return [ChannelSub(v, k.value, TYPE_TO_PATH[k]) for (k, v) in result.items()]


def fetch_channel(user_id, id):
    model = nt("model", "id date title sender")
    now = datetime.now()
    return [
        model(1, now + timedelta(days=x), "I love you", "Melissa") for x in range(50)
    ]
