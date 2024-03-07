from __future__ import annotations

import enum
from datetime import datetime
from typing import List

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from skimmer.db import Base

SYSTEM_GROUP_GENERAL = "General"


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]


class Group(Base):
    __tablename__ = "group"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    channel_id: Mapped[int] = mapped_column(ForeignKey("channel.id"))
    channel: Mapped["Channel"] = relationship(back_populates="groups")
    system: Mapped[bool]
    messages: Mapped[List["Message"]] = relationship(back_populates="group")


class ChannelType(enum.Enum):
    Google = "Google"
    GoogleImap = "Google IMAP"


class Channel(Base):
    __tablename__ = "channel"
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[ChannelType]
    identity: Mapped[str]
    access_token: Mapped[str]
    refresh_token: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped[User] = relationship()
    groups: Mapped[List["Group"]] = relationship(back_populates="channel")


class Message(Base):
    __tablename__ = "message"
    id: Mapped[int] = mapped_column(primary_key=True)
    sent: Mapped[datetime]
    sender: Mapped[str]
    external_id: Mapped[str]
    subject: Mapped[str]
    body: Mapped[str]
    hidden: Mapped[bool]
    group_id: Mapped[int] = mapped_column(ForeignKey("group.id"))
    group: Mapped["Group"] = relationship(back_populates="messages")
