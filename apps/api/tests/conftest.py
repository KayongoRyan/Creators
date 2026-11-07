import os
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret-must-be-32-bytes-min"
os.environ["AUTH_DEV"] = "1"
os.environ["SUPABASE_JWT_SECRET"] = ""
os.environ["SUPABASE_URL"] = "https://example.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-service-role"
os.environ["SUPABASE_ANON_KEY"] = "test-anon-key"
os.environ["UPLOAD_DIR"] = str(Path(__file__).resolve().parent / "uploads")

from app.core.config import get_settings

get_settings.cache_clear()

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.db import get_engine, session_factory
from app.db.base import Base
from app.db.seed import seed
from app.main import app


@pytest.fixture(autouse=True)
def fresh_database() -> Iterator[None]:
    engine = get_engine()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    db = session_factory()()
    try:
        seed(db)
        db.commit()
    finally:
        db.close()
    yield


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
