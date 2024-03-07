import imaplib
import shlex
import ssl
from collections import namedtuple as nt
from datetime import date, timedelta

from skimmer.dal.dto import ExternalMessage
from skimmer.dal.google import refresh_access_token
from skimmer.dal.models import ChannelType
from skimmer.dal.queries import create_or_update_channel, fetch_channel_tokens

_MONTH_NUM_TO_STR = [None, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


# eee
class GoogleImapDriver:
    type = ChannelType.GoogleImap
    host = "imap.gmail.com"

    def __init__(self, email):
        self.email = email

    def connect(self, access_token):
        auth_string = f"user={self.email}\1auth=Bearer {access_token}\1\1"
        conn = imaplib.IMAP4_SSL(self.host, ssl_context=ssl.create_default_context())
        conn.authenticate("XOAUTH2", lambda x: auth_string)
        conn.select("INBOX")
        self.conn = conn

    def refresh_access_token(self, refresh_token):
        token = refresh_access_token(refresh_token)
        self.connect(token)
        return token

    def set_label(self, uid, label):
        self.conn.copy(uid, "General")
        self.conn.store(uid, "+X-GM-LABELS", label)
        self.conn.store(uid, "+FLAGS", "(\\Deleted)")
        self.conn.expunge()


def remote_call(f):
    def g(channel_id, *args, **kwargs):
        (user_id, email, access_token, refresh_token, identity) = fetch_channel_tokens(channel_id)
        driver = GoogleImapDriver(email)

        try:
            driver.connect()
            return f(driver, *args, **kwargs)
        except Exception:
            access_token = driver.refresh_access_token(refresh_token)
            create_or_update_channel(user_id, access_token, refresh_token, driver.type, identity)
            return f(driver, *args, **kwargs)

    return g


@remote_call
def fetch_messages(driver, exclude):
    now = date.today() - timedelta(days=2)
    _, data = driver.conn.search(None, f"SINCE {now.day}-{_MONTH_NUM_TO_STR[now.month]}-{now.year}")
    result = []
    for e in data[0].split():
        _, msg = driver.conn.fetch(e, "BODY.PEEK[]")
        result.append(ExternalMessage(msg[0][1], lambda msg: msg.get("Message-ID")))
    return [e for e in result if e.id not in exclude]


@remote_call
def mark_read(driver, message):
    ok, data = driver.conn.search(None, f'(HEADER Message-ID "{message.external_id}")')

    if ok == "OK" and data[0]:
        uid = data[0].decode()

        driver.conn.store(uid, "+FLAGS", "(\\Seen)")

        if not message.group.system:
            folders = (e.decode() for e in driver.conn.list()[1])
            names = (shlex.split(e)[2] for e in folders)
            folder = next((e for e in names if e == message.group.name), None)
            if not folder:
                driver.conn.create(message.group.name)

            driver.set_label(uid, message.group.name)
