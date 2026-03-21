from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx
from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.models import Base
from app.routers import countries, history, onthisday, search


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        app.state.db_connected = True
    except Exception:
        app.state.db_connected = False
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0),
        headers={"User-Agent": settings.wikipedia_user_agent},
    )
    yield
    await app.state.http_client.aclose()
    try:
        await engine.dispose()
    except Exception:
        pass


app = FastAPI(
    title="Histarix API",
    description="Interactive world map history learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(countries.router)
app.include_router(history.router)
app.include_router(onthisday.router)
app.include_router(search.router)


@app.get("/api/health")
async def health() -> dict[str, str]:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "ok", "database": db_status}
