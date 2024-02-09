import dramatiq
from dramatiq import Message

broker = dramatiq.get_broker()


def queue_message_ack(id):
    broker.enqueue(Message(queue_name="default", actor_name="ack_message", args=(1,), kwargs={}, options={}))
