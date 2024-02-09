import dramatiq
from dramatiq.brokers.rabbitmq import RabbitmqBroker

from skimmer.config import Config
from skimmer.http import get

dramatiq.set_broker(RabbitmqBroker(url=Config.RABBITMQ_URI))


@dramatiq.actor(max_age=60000)
def refresh_channel(id):
    get(
        Config.Flask.FLASK_ENDPOINT_UPDATE_CHANNEL,
        timeout=5,
        params={"id": id},
    )


@dramatiq.actor(max_age=1000)
def cleanup_messages():
    get(Config.Flask.FLASK_ENDPOINT_VACUUM_MESSAGES)


@dramatiq.actor(max_age=1000)
def queue_update_channels():
    response = get(Config.Flask.FLASK_ENDPOINT_GET_CHANNELS)
    for e in response.json():
        refresh_channel.send(e)


@dramatiq.actor
def ack_message(id):
    print(id)
