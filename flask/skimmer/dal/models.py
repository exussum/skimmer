from __future__ import annotations

import enum
from typing import List

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from skimmer.db import Base


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


class ChannelType(enum.Enum):
    Google = "Google"


class Channel(Base):
    __tablename__ = "channel"
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[ChannelType]
    key: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    groups: Mapped[List["Group"]] = relationship(back_populates="channel")
