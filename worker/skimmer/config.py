import os

get = os.environ.get


class Config:
    RABBITMQ_URI = get("RABBITMQ_URI")
    MEMCACHED_SERVER = get("MEMCACHED_SERVER")

    class Flask:
        FLASK_ENDPOINT_UPDATE_CHANNEL = get("FLASK_ENDPOINT_UPDATE_CHANNEL")
        FLASK_ENDPOINT_MARK_READ = get("FLASK_ENDPOINT_MARK_READ")
        FLASK_ENDPOINT_VACUUM_MESSAGES = get("FLASK_ENDPOINT_VACUUM_MESSAGES")
        FLASK_ENDPOINT_GET_CHANNELS = get("FLASK_ENDPOINT_GET_CHANNELS")
        FLASK_SECRET_KEY = get("FLASK_SECRET_KEY")
