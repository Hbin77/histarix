import json
from typing import Any, Awaitable, Callable

import redis.asyncio as redis

from app.config import settings

_redis: redis.Redis | None = None

# TTL values in seconds
COUNTRY_TTL = 86400    # 24h
EVENT_TTL = 3600       # 1h
ONTHISDAY_TTL = 21600  # 6h


async def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None


async def cached_or_fetch(
    prefix: str, key: str, fetch_fn: Callable[[], Awaitable[Any]], ttl: int = 3600
) -> Any:
    r = await get_redis()
    cache_key = f"histarix:{prefix}:{key}"
    try:
        cached = await r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass

    result = await fetch_fn()

    try:
        # Convert pydantic models to dict for serialization
        if hasattr(result, "model_dump"):
            data = result.model_dump()
        elif isinstance(result, list) and result and hasattr(result[0], "model_dump"):
            data = [item.model_dump() for item in result]
        else:
            data = result
        await r.set(cache_key, json.dumps(data, default=str), ex=ttl)
    except Exception:
        pass

    return result
