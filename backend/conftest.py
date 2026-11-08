import os
from pathlib import Path

import pytest
import pytest_asyncio
from dotenv import load_dotenv
from fastapi.testclient import TestClient

TEST_ENV_FILE = Path(__file__).resolve().parent / ".env.test"
load_dotenv(TEST_ENV_FILE, override=True)

from app.database import db
from app.main import app


@pytest_asyncio.fixture(scope="session")
async def prisma_db():
    """Provide one Prisma connection to the isolated test database."""
    database_url = os.getenv("DATABASE_URL", "")
    if "tanafit_test_db" not in database_url:
        raise RuntimeError(
            "pytest requires DATABASE_URL from backend/.env.test "
            "to target tanafit_test_db"
        )

    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
