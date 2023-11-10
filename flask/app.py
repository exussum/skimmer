from flask import Flask, session, redirect
from urllib.parse import urlunsplit, urlencode, urlsplit
import random
import string

from config import Config


app = Flask(__name__)
app.secret_key = Config.Flask.SECRET_KEY
print(app.secret_key)

RANDOM_CHARACTERS = string.ascii_lowercase + string.digits

def random_id():
    generator = random.SystemRandom()
    return ''.join(generator.choice(RANDOM_CHARACTERS) for _ in range(32))

@app.route("/auth/check")
def login():
    if 'user' not in session:
        session['state'] = random_id()
        parts = urlsplit(Config.Google.URL_AUTH)
        params = urlencode({
           "client_id": Config.Google.GOOGLE_CLIENT_ID,
           "redirect_uri": Config.Google.GOOGLE_REDIRECT_URL,
           "response_type": "code",
           "scope": ["email"],
           "state": session['state']
        })
        url = urlunsplit(parts[:3] + (params,) + parts[4:])
        return redirect(url)
    else:
        return session['user']    

@app.route("/auth/logout")
def logout():
    session.clear()
    return redirect("/")
