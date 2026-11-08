from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.auth import get_current_user
from app.main import app
from app.schemas.system import ClassCreate, InvoiceCreate


@pytest.fixture
def isolated_app(monkeypatch):
    @asynccontextmanager
    async def test_lifespan(_app):
        del _app
        yield

    monkeypatch.setattr(app.router, "lifespan_context", test_lifespan)
    yield
    app.dependency_overrides.clear()


def test_system_routes_are_in_openapi():
    paths = app.openapi()["paths"]

    assert "/api/v1/plans" in paths
    assert "/api/v1/classes/{class_id}/book" in paths
    assert "/api/v1/invoices/{invoice_id}/pay" in paths
    assert "/api/v1/reports/revenue" in paths


def test_root_returns_health_and_service_metadata(isolated_app):
    del isolated_app

    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Welcome to TanaFit OS API"
    assert body["api_name"] == "TanaFit OS API"
    assert body["api_version"] == "1.0.0"
    assert body["status"] == "online"
    assert body["environment"] == "development"
    assert body["timestamp"].endswith("+00:00")
    assert body["documentation"] == {
        "scalar": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
    }
    assert body["runtime"]["framework"] == "FastAPI"
    assert body["runtime"]["python_version"]
    assert body["runtime"]["framework_version"]


def test_redoc_documentation_is_available(isolated_app):
    del isolated_app

    with TestClient(app) as client:
        response = client.get("/redoc")

    assert response.status_code == 200


def test_class_schedule_requires_end_after_start():
    start = datetime.now(timezone.utc)

    with pytest.raises(ValidationError):
        ClassCreate(
            trainer_id="b3787b5a-e8b3-4a13-a8e0-1d028a963a84",
            name="Strength",
            schedule_start=start,
            schedule_end=start - timedelta(minutes=1),
            capacity=10,
        )


def test_invoice_total_is_calculated_from_line_items():
    invoice = InvoiceCreate(
        member_id="b3787b5a-e8b3-4a13-a8e0-1d028a963a84",
        items=[
            {"description": "Monthly membership", "amount": "25.50"},
            {"description": "Registration", "amount": "4.50"},
        ],
    )

    assert invoice.total_amount == Decimal("30.00")


def test_ai_generation_returns_explicit_unavailable_response(isolated_app):
    del isolated_app

    async def fake_user():
        return SimpleNamespace(id="user-id", role="MEMBER")

    app.dependency_overrides[get_current_user] = fake_user
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/v1/ai/request",
                json={
                    "request_type": "fitness_qa",
                    "request_content": "How should I warm up?",
                },
            )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 503
    assert "AI provider" in response.json()["detail"]


def test_members_cannot_list_all_users(isolated_app):
    del isolated_app

    async def fake_user():
        return SimpleNamespace(id="user-id", role="MEMBER")

    app.dependency_overrides[get_current_user] = fake_user
    try:
        with TestClient(app) as client:
            response = client.get("/api/v1/users/")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 403


def test_members_cannot_change_membership_status(isolated_app):
    del isolated_app

    async def fake_user():
        return SimpleNamespace(
            id="b3787b5a-e8b3-4a13-a8e0-1d028a963a84",
            role="MEMBER",
        )

    app.dependency_overrides[get_current_user] = fake_user
    try:
        with TestClient(app) as client:
            response = client.patch(
                "/api/v1/members/b3787b5a-e8b3-4a13-a8e0-1d028a963a84",
                json={"membershipStatus": "active"},
            )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 403


def test_frontend_origin_can_make_authenticated_api_requests(isolated_app):
    del isolated_app

    with TestClient(app) as client:
        response = client.options(
            "/api/v1/auth/me",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
