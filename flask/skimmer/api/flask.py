from functools import wraps

from flask import request, session
from skimmer.config import Config


def protect(f):
    @wraps(f)
    def g(*args, **kwargs):
        if "user_id" in session:
            return f(session["user_id"], *args, **kwargs)
        return {}, 401

    return g


def server_call(f):
    @wraps(f)
    def g(*args, **kwargs):
        if not Config.Flask.FLASK_SECRET_KEY:
            raise Exception("FLASK_SECRET_KEY not set")
        if request.headers.get("Skimmer-Api-Auth") == Config.Flask.FLASK_SECRET_KEY:
            return f(*args, **kwargs)
        return "", 401

    return g
