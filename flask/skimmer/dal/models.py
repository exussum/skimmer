from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from skimmer.db import Base


class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]


class Group(Base):
    __tablename__ = "group"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
