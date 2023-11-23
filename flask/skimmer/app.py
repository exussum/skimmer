import click
from flask_cors import CORS
from flask_session import Session
from pymemcache.client.base import Client

from flask import Flask
from skimmer.config import Config
from skimmer.db import db
from skimmer.views import auth, group, i18n

app = Flask(__name__)
app.config.update(
    {
        "SECRET_KEY": Config.Flask.FLASK_SECRET_KEY,
        "SESSION_TYPE": "memcached",
        "SESSION_MEMCACHED": Client(Config.Memcached.MEMCACHED_SERVER),
        "SESSION_KEY_PREFIX": Config.Memcached.MEMCACHED_KEY_PREFIX,
        "PERMANENT_SESSION_LIFETIME": Config.Flask.FLASK_PERMANENT_SESSION_LIFETIME,
        "SQLALCHEMY_DATABASE_URI": Config.Flask.FLASK_SQLALCHEMY_DATABASE_URI,
    }
)

app.register_blueprint(auth.bp, url_prefix="/auth")
app.register_blueprint(i18n.bp, url_prefix="/i18n")
app.register_blueprint(group.bp, url_prefix="/group")

CORS(
    app,
    origins=["http://localhost:8080", "http://localhost:8000"],
    supports_credentials=True,
)
Session(app)
db.init_app(app)
