import os

get = lambda e: os.environ.get(e)


class Config:
    class Google:
        GOOGLE_CLIENT_ID = get("GOOGLE_CLIENT_ID")
        GOOGLE_CLIENT_SECRET = get("GOOGLE_CLIENT_SECRET")
        GOOGLE_REDIRECT_URL = get("GOOGLE_REDIRECT_URL")
        URL_TOKEN = "https://oauth2.googleapis.com/token"
        URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"

    class Flask:
        SECRET_KEY = get("FLASK_SECRET_KEY") or "abc123"

    class React:
        REACT_HOME_URL = get("REACT_HOME_URL")
