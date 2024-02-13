import os

import click
import dramatiq
from dramatiq.brokers.rabbitmq import RabbitmqBroker
from flask_cors import CORS
from flask_session import Session
from pylibmc import Client

from flask import Flask
from skimmer.config import Config
from skimmer.db import db
from skimmer.views import auth, channel, group, i18n, message, tasks

app = Flask(__name__)
app.config.update(
    {
        "SECRET_KEY": Config.Flask.FLASK_SECRET_KEY,
        "SESSION_TYPE": "memcached",
        "SESSION_MEMCACHED": Client([Config.Memcached.MEMCACHED_SERVER]),
        "SESSION_KEY_PREFIX": Config.Memcached.MEMCACHED_KEY_PREFIX,
        "PERMANENT_SESSION_LIFETIME": Config.Flask.FLASK_PERMANENT_SESSION_LIFETIME,
        "SQLALCHEMY_DATABASE_URI": Config.Flask.FLASK_SQLALCHEMY_DATABASE_URI,
        "DEBUG": os.environ.get("DEBUG") == "true",
    }
)
for path, mod in {
    "/auth": auth,
    "/i18n": i18n,
    "/group": group,
    "/channel": channel,
    "/tasks": tasks,
    "/message": message,
}.items():
    app.register_blueprint(mod.bp, url_prefix=path)

CORS(
    app,
    origins=["http://localhost:8080", "http://localhost:8000"],
    supports_credentials=True,
)
Session(app)
db.init_app(app)
dramatiq.set_broker(RabbitmqBroker(url=Config.Rmq.RABBITMQ_URI))
