import requests

from skimmer.config import Config


def get(*args, **kwargs):
    if not Config.Flask.FLASK_SECRET_KEY:
        raise Exception("Skimmer flask api key not set")
    response = requests.get(*args, **kwargs, headers={"Skimmer-Api-Auth": Config.Flask.FLASK_SECRET_KEY})
    response.raise_for_status()
    return response
