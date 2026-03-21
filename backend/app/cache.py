import asyncio
from typing import Any, Awaitable, Callable

from cachetools import TTLCache

country_cache: TTLCache = TTLCache(maxsize=500, ttl=86400)
event_cache: TTLCache = TTLCache(maxsize=1000, ttl=3600)
onthisday_cache: TTLCache = TTLCache(maxsize=400, ttl=21600)

_lock = asyncio.Lock()


async def cached_or_fetch(
    cache: TTLCache, key: str, fetch_fn: Callable[[], Awaitable[Any]]
) -> Any:
    if key in cache:
        return cache[key]
    async with _lock:
        if key in cache:
            return cache[key]
        result = await fetch_fn()
        cache[key] = result
        return result
