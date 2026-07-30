import os

# Settings (app/config.py) requires these at import time; default them so the
# suite runs on a clean checkout. Exported env vars still win; a backend/.env
# file does not — tests deliberately never touch a real database.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "test-secret-not-for-production")

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as c:
        yield c
