from contextlib import asynccontextmanager
from datetime import datetime, timezone
import os
from pathlib import Path
import platform

from dotenv import load_dotenv
import fastapi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from scalar_fastapi import get_scalar_api_reference

from app.database import connect_db, disconnect_db
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.managers import router as managers_router
from app.routers.members import router as members_router
from app.routers.system import router as system_router
from app.routers.trainers import router as trainers_router
from app.routers.users import router as users_router

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_DESCRIPTION = """
# TanaFit OS API - Intelligent Gym & Fitness Management Platform

Welcome to the **TanaFit OS API**, a production-grade enterprise backend powering modern fitness clubs, gym franchises, personal training networks, and member engagement portals.

---

### Key Functional Domains

| Domain | Description | Access Tier |
| :--- | :--- | :--- |
| **Authentication & RBAC** | JWT-based Bearer authentication with strict role-based access control | Public & Authenticated |
| **Users & Identity** | Centralized directory managing Admins, Managers, Trainers, and Members | Multi-Role |
| **Memberships & Plans** | Subscription tiers, auto-renewals, customizable benefits, and billing | Multi-Role |
| **Classes & Bookings** | Group fitness schedules, trainer allocation, and seat reservations | Multi-Role |
| **Attendance Tracking** | Turnstile check-ins, check-outs, and live facility occupancy tracking | Member / Staff |
| **Equipment & Maintenance** | Asset registry, condition statuses, and service work orders | Manager / Admin |
| **Workout Plans & Progress** | Structured regimens, exercise catalogs, and body composition analytics | Trainer / Member |
| **TanaFit AI Assistant** | AI-driven workout routine generation, exercise tips, and fitness Q&A | Authenticated |
| **Analytics & Reports** | Financial revenue metrics, attendance trends, and trainer utilization | Admin / Manager |

---

### Authentication Guide

All protected endpoints require an `Authorization` HTTP header with a valid JSON Web Token:
```http
Authorization: Bearer <your_jwt_access_token>
```

#### System Roles & Permissions:
- **`ADMIN`**: Full platform control, user directory administration, financial reconciliation, and global configuration.
- **`MANAGER`**: Operations oversight, member listings, trainer rosters, equipment maintenance, and facility reports.
- **`TRAINER`**: Class schedule management, client workout plans, progress recording, and coaching tools.
- **`MEMBER`**: Self-service profile, class reservations, workout plan review, attendance tracking, and AI fitness assistant.

---

### Documentation Portals
- **Interactive Documentation (Scalar)**: [`/docs`](/docs)
- **Interactive Swagger UI**: [`/swagger`](/swagger)
- **Structured Specification (ReDoc)**: [`/redoc`](/redoc)
- **Raw OpenAPI Specification**: [`/openapi.json`](/openapi.json)
"""

TAGS_METADATA = [
    {
        "name": "auth",
        "description": "Authentication flows, JWT issuance, password verification, and authenticated user identity (`/me`).",
    },
    {
        "name": "users",
        "description": "Core user identity directory, multi-role account provisioning, and user list filtering.",
    },
    {
        "name": "members",
        "description": "Gym member profiles, fitness goals, health disclosures, date of birth, and emergency contacts.",
    },
    {
        "name": "trainers",
        "description": "Certified personal trainer profiles, coaching specialties, biographies, and session ratings.",
    },
    {
        "name": "managers",
        "description": "Gym floor and operations management profiles and departmental assignments.",
    },
    {
        "name": "admin",
        "description": "Administrative intelligence, high-level user statistics, and payment ledger reconciliation.",
    },
    {
        "name": "membership plans",
        "description": "Subscription pricing tiers, gym pass duration, promotional rates, and membership perks.",
    },
    {
        "name": "memberships",
        "description": "Active member subscription tracking, start/expiry dates, auto-renewal configurations, and cancellations.",
    },
    {
        "name": "classes",
        "description": "Group fitness classes (Spin, HIIT, Yoga), trainer schedules, time slots, and capacity ceilings.",
    },
    {
        "name": "class bookings",
        "description": "Member class seat reservations, waitlists, attendee rosters, and reservation cancellations.",
    },
    {
        "name": "attendance",
        "description": "Gym floor turnstile check-ins, check-outs, and live facility occupancy tracking.",
    },
    {
        "name": "equipment",
        "description": "Gym inventory management, equipment operational status (good/maintenance/broken), and locations.",
    },
    {
        "name": "maintenance",
        "description": "Machinery servicing schedules, repair work orders, and maintenance expense logging.",
    },
    {
        "name": "workout plans",
        "description": "Custom fitness regimens, weekly exercise routines, assigned trainers, and structured workouts.",
    },
    {
        "name": "progress",
        "description": "Physical transformation tracking: weight, body fat %, performance benchmarks, and trainer notes.",
    },
    {
        "name": "invoices and payments",
        "description": "Billing engine: multi-item invoice generation, transaction logging, manual reconciliation, and payment status.",
    },
    {
        "name": "notifications",
        "description": "Member announcements, class cancellation notices, automated payment alerts, and push updates.",
    },
    {
        "name": "reports",
        "description": "Executive analytics: revenue aggregations, membership growth curves, attendance density, and trainer workloads.",
    },
    {
        "name": "AI",
        "description": "Tana AI Fitness Assistant: AI-driven custom workout routine generator, exercise technique advisor, and fitness Q&A.",
    },
    {
        "name": "health",
        "description": "System health diagnostics, environment configuration, database connection status, and runtime metadata.",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print("Successfully connected to the database")
    yield
    await disconnect_db()
    print("Disconnected from the database")


app = FastAPI(
    title="TanaFit OS API",
    version="1.0.0",
    description=API_DESCRIPTION,
    openapi_tags=TAGS_METADATA,
    contact={
        "name": "TanaFit Engineering Team",
        "email": "support@tanafit.com",
        "url": "https://tanafit.com",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://tanafit.com/license",
    },
    lifespan=lifespan,
    docs_url=None,
    redoc_url="/redoc",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(admin_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(members_router, prefix="/api/v1")
app.include_router(trainers_router, prefix="/api/v1")
app.include_router(managers_router, prefix="/api/v1")
app.include_router(system_router, prefix="/api/v1")


@app.get("/docs", include_in_schema=False)
async def scalar_docs():
    """Render interactive modern API documentation via Scalar."""
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=f"{app.title} — API Reference",
        theme="purple",
        dark_mode=True,
    )


@app.get("/swagger", include_in_schema=False)
async def swagger_docs():
    """Render custom dark-themed Swagger UI documentation."""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} — Swagger UI",
        swagger_css_url="/static/custom_swagger.css",
        swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
    )


@app.get("/", tags=["health"], summary="Return API health and service metadata")
async def root() -> dict[str, object]:
    environment = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development"))

    return {
        "message": f"Welcome to {app.title}",
        "api_name": app.title,
        "api_version": app.version,
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": environment.strip().lower(),
        "documentation": {
            "scalar": "/docs",
            "redoc": "/redoc",
            "openapi": app.openapi_url,
        },
        "runtime": {
            "python_version": platform.python_version(),
            "framework": "FastAPI",
            "framework_version": fastapi.__version__,
        },
    }
