import os
from datetime import datetime

import dramatiq
import psycopg2
import requests
from apscheduler.schedulers.blocking import BlockingScheduler
from dramatiq.brokers.rabbitmq import RabbitmqBroker

WORKER_DB_URI = os.environ.get("WORKER_DB_URI")
RABBITMQ_URI = os.environ.get("RABBITMQ_URI")
FLASK_API_ENDPOINT_UPDATE_CHANNEL = os.environ.get("FLASK_API_ENDPOINT_UPDATE_CHANNEL")

dramatiq.set_broker(RabbitmqBroker(url=RABBITMQ_URI))


@dramatiq.actor(max_age=60000)
def refresh_channel(id):
    requests.get(FLASK_API_ENDPOINT_UPDATE_CHANNEL, timeout=5, data={"id": id})


def queue_update_channels():
    conn = psycopg2.connect(WORKER_DB_URI)
    try:
        with conn, conn.cursor() as curs:
            curs.execute("select id from channel")
            while rows := curs.fetchmany(10):
                for e in rows:
                    refresh_channel.send(rows[0])

    finally:
        conn.close()


def scheduler():
    scheduler = BlockingScheduler()
    scheduler.add_job(
        queue_update_channels, "interval", minutes=1, next_run_time=datetime.now()
    )
    scheduler.start()
