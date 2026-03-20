from contextlib import asynccontextmanager
from typing import AsyncGenerator

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import countries, history, onthisday, search


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0),
        headers={"User-Agent": settings.wikipedia_user_agent},
    )
    yield
    await app.state.http_client.aclose()


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
    return {"status": "ok"}
