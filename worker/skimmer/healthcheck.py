import os
import sys
import time

import pika
from pika.connection import URLParameters
from pika.exceptions import AMQPConnectionError

uri = os.environ.get("RABBITMQ_URI")

success = False
for x in range(30):
    try:
        connection = pika.BlockingConnection(URLParameters(uri))
        connection.close()
        success = True
        break
    except AMQPConnectionError as e:
        time.sleep(2)

if not success:
    raise Exception(f"Cannot connect to: {uri}")
