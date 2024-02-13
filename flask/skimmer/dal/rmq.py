import dramatiq
from dramatiq import Message


def queue_mark_read(user_id, ids):
    broker = dramatiq.get_broker()

    for id in ids:
        broker.enqueue(Message(queue_name="default", actor_name="mark_read", args=(user_id, id), kwargs={}, options={}))
