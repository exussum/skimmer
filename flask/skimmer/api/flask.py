from functools import wraps

from flask import session


def protect(f):
    @wraps(f)
    def g(*args, **kwargs):
        return f(session["user_id"], *args, **kwargs)

    return g
