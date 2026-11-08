from contextlib import asynccontextmanager
from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.core import auth as core_auth
from app.core.security import verify_password
from app.main import app
from app.routers import auth
from app.services import user_service


class DuplicateEmailUserActions:
    async def create(self, *, data, **kwargs):
        del data, kwargs
        from prisma.errors import UniqueViolationError

        raise UniqueViolationError(
            {
                "user_facing_error": {
                    "message": "Unique constraint failed on the fields: (`email`)",
                }
            }
        )


class DuplicateEmailDatabase:
    def __init__(self):
        self.user = DuplicateEmailUserActions()


class FakeUserActions:
    def __init__(self):
        self.users = {}

    async def create(self, *, data, **kwargs):
        del kwargs
        now = datetime.now(timezone.utc)
        user_id = uuid4()
        user = {
            **data,
            "id": user_id,
            "phone": None,
            "isActive": True,
            "createdAt": now,
            "updatedAt": now,
        }
        for profile_name in (
            "adminProfile",
            "managerProfile",
            "trainerProfile",
            "memberProfile",
        ):
            if profile_name in user:
                user[profile_name] = {
                    "id": uuid4(),
                    "userId": user_id,
                    **(
                        {
                            "joinDate": now,
                            "membershipStatus": "active",
                            "memberships": [],
                        }
                        if profile_name == "memberProfile"
                        else {}
                    ),
                }
        self.users[user["email"]] = user
        return SimpleNamespace(**user)

    async def find_unique(self, *, where, **kwargs):
        del kwargs
        if "email" in where:
            user = self.users.get(where["email"])
        else:
            user = next(
                (item for item in self.users.values() if str(item["id"]) == where["id"]),
                None,
            )
        return SimpleNamespace(**user) if user is not None else None


class FakeDatabase:
    def __init__(self):
        self.user = FakeUserActions()


@pytest.fixture
def client(monkeypatch):
    fake_db = FakeDatabase()

    @asynccontextmanager
    async def test_lifespan(_app):
        del _app
        yield

    monkeypatch.setattr(app.router, "lifespan_context", test_lifespan)
    monkeypatch.setattr(user_service, "db", fake_db)
    monkeypatch.setattr(auth, "db", fake_db)
    monkeypatch.setattr(core_auth, "db", fake_db)
    monkeypatch.setenv(
        "JWT_SECRET_KEY",
        "test-only-secret-key-that-is-at-least-32-bytes",
    )

    with TestClient(app) as test_client:
        yield test_client, fake_db


def test_create_user_then_login(client):
    test_client, fake_db = client
    password = "correct-horse-battery-staple"
    email = "member@example.com"

    create_response = test_client.post(
        "/api/v1/users/",
        json={
            "fullName": "Test Member",
            "email": email,
            "password": password,
        },
    )

    assert create_response.status_code == 201
    assert create_response.json()["email"] == email
    assert "password" not in create_response.json()

    stored_user = fake_db.user.users[email]
    assert stored_user["passwordHash"] != password
    assert verify_password(password, stored_user["passwordHash"])

    login_response = test_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )

    assert login_response.status_code == 200
    assert login_response.json()["token_type"] == "bearer"
    assert login_response.json()["access_token"]


def test_register_login_and_get_current_user(client):
    test_client, _ = client
    password = "correct-horse-battery-staple"
    email = "new-member@example.com"

    register_response = test_client.post(
        "/api/v1/auth/register",
        json={
            "fullName": "New Member",
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201
    assert register_response.json()["role"] == "MEMBER"

    login_response = test_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200

    me_response = test_client.get(
        "/api/v1/auth/me",
        headers={
            "Authorization": f"Bearer {login_response.json()['access_token']}"
        },
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == email
    assert me_response.json()["role"] == "MEMBER"


def test_register_rejects_duplicate_email(monkeypatch):
    duplicate_db = DuplicateEmailDatabase()
    monkeypatch.setattr(user_service, "db", duplicate_db)

    @asynccontextmanager
    async def test_lifespan(_app):
        del _app
        yield

    monkeypatch.setattr(app.router, "lifespan_context", test_lifespan)

    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/auth/register",
            json={
                "fullName": "Duplicate Member",
                "email": "member@example.com",
                "password": "correct-horse-battery-staple",
            },
        )

    assert response.status_code == 400
    assert response.json() == {"detail": "Email is already registered"}
