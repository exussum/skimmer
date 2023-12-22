import os
from contextlib import contextmanager
from datetime import datetime

import dramatiq
import psycopg2
import requests
from apscheduler.schedulers.blocking import BlockingScheduler
from dramatiq.brokers.rabbitmq import RabbitmqBroker

WORKER_DB_URI = os.environ.get("WORKER_DB_URI")
RABBITMQ_URI = os.environ.get("RABBITMQ_URI")
FLASK_API_ENDPOINT_UPDATE_CHANNEL = os.environ.get("FLASK_API_ENDPOINT_UPDATE_CHANNEL")
FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")

dramatiq.set_broker(RabbitmqBroker(url=RABBITMQ_URI))


@dramatiq.actor(max_age=60000)
def refresh_channel(id):
    if not FLASK_SECRET_KEY:
        raise Exception("Skimmer flask api key not set")
    response = requests.get(
        FLASK_API_ENDPOINT_UPDATE_CHANNEL,
        timeout=5,
        params={"id": id},
        headers={"Skimmer-Api-Auth": FLASK_SECRET_KEY},
    )
    response.raise_for_status()


def cleanup_messages():
    with connection() as curs:
        curs.execute("UPDATE message SET hidden = true WHERE sent < current_date - interval '1' day")
        curs.execute("DELETE FROM message WHERE hidden = true AND sent < current_date - interval '30' day")


def queue_update_channels():
    with connection() as curs:
        curs.execute("SELECT id FROM channel")
        while rows := curs.fetchmany(10):
            for e in rows:
                refresh_channel.send(rows[0])


@contextmanager
def connection():
    conn = psycopg2.connect(WORKER_DB_URI)
    try:
        with conn, conn.cursor() as curs:
            yield curs
    finally:
        conn.close()


def scheduler():
    scheduler = BlockingScheduler()
    scheduler.add_job(queue_update_channels, "interval", minutes=1, next_run_time=datetime.now())
    scheduler.add_job(cleanup_messages, "interval", minutes=10, next_run_time=datetime.now())
    scheduler.start()
