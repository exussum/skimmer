from functools import wraps

from flask import session


def protect(f):
    @wraps(f)
    def g(*args, **kwargs):
        if "user_id" in session:
            return f(session["user_id"], *args, **kwargs)
        return {}, 401

    return g
