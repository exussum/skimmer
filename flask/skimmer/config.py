import logging
import os
import sys

logger = logging.getLogger()

get = lambda e: os.environ.get(e) or logge
missing_vars = []


def get(e):
    value = os.environ.get(e)
    if value is None:
        missing_vars.append(e)
    return value


class Config:
    class Google:
        GOOGLE_CLIENT_ID = get("GOOGLE_CLIENT_ID")
        GOOGLE_CLIENT_SECRET = get("GOOGLE_CLIENT_SECRET")
        GOOGLE_REDIRECT_URL = get("GOOGLE_REDIRECT_URL")
        URL_TOKEN = "https://oauth2.googleapis.com/token"
        URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"

    class Flask:
        FLASK_SECRET_KEY = get("FLASK_SECRET_KEY")
        FLASK_PERMANENT_SESSION_LIFETIME = int(get("FLASK_PERMANENT_SESSION_LIFETIME") or 0)
        FLASK_SQLALCHEMY_DATABASE_URI = get("FLASK_SQLALCHEMY_DATABASE_URI")
        FLASK_CHANNEL_URL = get("FLASK_CHANNEL_URL")

    class React:
        REACT_HOME_URL = get("REACT_HOME_URL")

    class Memcached:
        MEMCACHED_KEY_PREFIX = get("MEMCACHED_KEY_PREFIX")
        MEMCACHED_SERVER = get("MEMCACHED_SERVER")


if missing_vars:
    logger.fatal("Environment variables not set:")
    for e in missing_vars:
        logger.fatal(f"- {e}")

    # Shuts down gunicorn parent process
    sys.exit(4)
