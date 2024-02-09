#!/usr/bin/env python3

import configparser
import json
import os
import shutil

SCHEMA = "env.schema.json"


def get_config():
    config = configparser.ConfigParser()
    config.optionxform = str
    if os.path.isfile(".env"):
        config.read(".env")
    else:
        config.read(".env.example")

    schema = json.load(open(SCHEMA))
    for section, pairs in schema.items():
        if section not in config.sections():
            config[section] = {}
        for k in pairs:
            if k not in config[section]:
                config[section][k] = ""
    return config


def update_from_user(config):
    for section, pairs in config.items():
        for k, v in pairs.items():
            prompt = f"[{section}] Value for {k}: " if not v else f"[{section}] Value for {k} (default {v}): "
            pairs[k] = input(prompt) or v


def write(config):
    with open(".env", "w") as fh:
        config.write(fh)

    for s in ("flask", "react", "worker", "k8s"):
        with open(f"{s}/.env", "w") as fh:
            for k, v in config[s].items():
                print(f"{k}={v}", file=fh)
    shutil.copyfile(SCHEMA, f"k8s/{SCHEMA}")


def generate_self_cert():
    if not (os.path.isfile("react/nginx/key.pem") and os.path.isfile("react/nginx/cert.pem")):
        print("Generating self signed certs")
        os.system(
            """openssl req -x509 -newkey rsa:4096 -keyout react/nginx/key.pem -out react/nginx/cert.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=StateName/L=CityName/O=CompanyName/OU=CompanySectionName/CN=CommonNameOrHostname" """
        )


def brew_update():
    os.system("brew install ariga/tap/atlas")


config = get_config()
update_from_user(config)
write(config)
generate_self_cert()
brew_update()
