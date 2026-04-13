import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx

logger = logging.getLogger("histarix")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.cache import close_redis
from app.config import settings
from app.database import async_session, engine
from app.models import Base
from app.routers import auth, chat, countries, history, onthisday
from app.seed import seed_countries, seed_historical_events


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with async_session() as session:
            await seed_countries(session)
            await seed_historical_events(session)
        app.state.db_connected = True
        logger.info("Database initialized and seeded successfully")
    except Exception as e:
        logger.error("Database initialization failed: %s", e)
        app.state.db_connected = False
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0),
        headers={"User-Agent": settings.wikipedia_user_agent},
    )
    yield
    await app.state.http_client.aclose()
    await close_redis()
    try:
        await engine.dispose()
    except Exception as e:
        logger.warning("Engine disposal failed: %s", e)


app = FastAPI(
    title="Histarix API",
    description="Interactive world map history learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(countries.router)
app.include_router(history.router)
app.include_router(onthisday.router)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
