#!/usr/bin/env python3

import configparser
import os

config = configparser.ConfigParser()
config.optionxform = str

schema = {
    "flask": {
        "CHANNEL_GOOGLE_REDIRECT_URL",
        "FLASK_PERMANENT_SESSION_LIFETIME",
        "FLASK_SQLALCHEMY_DATABASE_URI",
        "FLASK_SECRET_KEY",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URL",
        "MEMCACHED_KEY_PREFIX",
        "MEMCACHED_SERVER",
        "REACT_HOME_URL",
    },
    "worker": {
        "FLASK_API_ENDPOINT_UPDATE_CHANNEL",
        "FLASK_SECRET_KEY",
        "RABBITMQ_URI",
        "WORKER_DB_URI",
    },
    "react": {"REACT_APP_SKIMMER_API_URL"},
    "k8s": {"PULUMI_KEY", "DB_URI"},
}

config.read(".env")

for section, pairs in schema.items():
    if section not in config.sections():
        config[section] = {}
    for k in pairs:
        if k not in config[section]:
            config[section][k] = ""

for section, pairs in config.items():
    for k, v in pairs.items():
        prompt = f"[{section}] Value for {k}: " if not v else f"[{section}] Value for {k} (default {v}): "
        pairs[k] = input(prompt) or v

with open(".env", "w") as fh:
    config.write(fh)

for s in ("flask", "react", "worker"):
    with open(f"{s}/.env", "w") as fh:
        for k, v in config["flask"].items():
            print(f"{k}={v}", file=fh)

if not (os.path.isfile("react/nginx/key.pem") and os.path.isfile("react/nginx/cert.pem")):
    print("Generating self signed certs")
    os.system(
        """openssl req -x509 -newkey rsa:4096 -keyout react/nginx/key.pem -out react/nginx/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname" """
    )

os.system("brew install ariga/tap/atlas")
