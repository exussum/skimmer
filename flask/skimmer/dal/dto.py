import email
from collections import namedtuple as nt
from datetime import datetime
from email import policy, utils

from bs4 import BeautifulSoup
from bs4.element import Comment

_ExternalMessage = nt("ExternalMessage", "id sent sender subject body")


def ExternalMessage(bytes, id_f):
    message = email.message_from_bytes(bytes, policy=policy.default)
    sent = utils.parsedate_to_datetime(message.get("date"))
    frm = message.get("from")
    subject = message.get("subject")
    text_content = next((e for e in message.walk() if e.get_content_type() == "text/plain"), None)
    html_content = next((e for e in message.walk() if e.get_content_type() == "text/html"), None)

    return _ExternalMessage(
        id_f(message),
        sent,
        frm,
        subject,
        (text_content and text_content.get_content().strip())
        or (html_content and _strip_html(html_content.get_content()))
        or "",
    )


def _tag_visible(element):
    return (not element.parent.name in ["style", "script", "head", "title", "meta", "[document]"]) and (
        not isinstance(element, Comment)
    )


def _strip_html(body):
    soup = BeautifulSoup(body, "html.parser")
    texts = soup.findAll(text=True)
    visible_texts = filter(_tag_visible, texts)
    return " ".join(t.strip() for t in filter(_tag_visible, texts)).replace("\r", " ").replace("\n", " ")
