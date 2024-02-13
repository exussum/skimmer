import time
from functools import wraps

import dramatiq
from dramatiq.brokers.rabbitmq import RabbitmqBroker
from dramatiq.rate_limits import WindowRateLimiter
from dramatiq.rate_limits.backends.memcached import MemcachedBackend

from skimmer.config import Config
from skimmer.http import get

integration_rate_limiter = WindowRateLimiter(
    MemcachedBackend(servers=[Config.MEMCACHED_SERVER]), key="integrations", limit=1
)
dramatiq.set_broker(RabbitmqBroker(url=Config.RABBITMQ_URI))


def rate_limited(f):
    @wraps(f)
    def g(*args, **kwargs):
        while True:
            with integration_rate_limiter.acquire(raise_on_failure=False) as acquired:
                if acquired:
                    return f(*args, **kwargs)
            time.sleep(1)

    return g


@dramatiq.actor(max_age=60000, max_retries=0)
@rate_limited
def refresh_channel(id):
    get(
        Config.Flask.FLASK_ENDPOINT_UPDATE_CHANNEL,
        timeout=10,
        params={"id": id},
    )


@dramatiq.actor(max_age=1000)
def cleanup_messages():
    get(Config.Flask.FLASK_ENDPOINT_VACUUM_MESSAGES)


@dramatiq.actor(max_age=1000, max_retries=0)
def queue_update_channels():
    response = get(Config.Flask.FLASK_ENDPOINT_GET_CHANNELS)
    for e in response.json():
        refresh_channel.send(e)


@dramatiq.actor
@rate_limited
def mark_read(user_id, id):
    get(Config.Flask.FLASK_ENDPOINT_MARK_READ, params={"user_id": user_id, "id": id})
