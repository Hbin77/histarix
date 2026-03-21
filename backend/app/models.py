from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    iso_a2: Mapped[str] = mapped_column(String(2), unique=True, nullable=False, index=True)
    iso_a3: Mapped[str | None] = mapped_column(String(3))
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ko: Mapped[str | None] = mapped_column(String(255))
    wikidata_id: Mapped[str | None] = mapped_column(String(20))
    continent: Mapped[str | None] = mapped_column(String(50))
    region: Mapped[str | None] = mapped_column(String(100))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)


class HistoricalEvent(Base):
    __tablename__ = "historical_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    year: Mapped[int | None] = mapped_column(Integer, index=True)
    date: Mapped[str | None] = mapped_column(String(20))
    country_iso: Mapped[str | None] = mapped_column(String(2), ForeignKey("countries.iso_a2"), index=True)
    category: Mapped[str | None] = mapped_column(String(50))
    importance: Mapped[int] = mapped_column(Integer, default=1)
    wikipedia_url: Mapped[str | None] = mapped_column(String(500))
    image_url: Mapped[str | None] = mapped_column(String(500))
    wikidata_id: Mapped[str | None] = mapped_column(String(20))


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    country_iso: Mapped[str] = mapped_column(String(2), nullable=False)
    visited_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    quiz_score: Mapped[int | None] = mapped_column(Integer)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0)


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    icon: Mapped[str | None] = mapped_column(String(10))
    requirement: Mapped[str | None] = mapped_column(String(255))


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id"), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
