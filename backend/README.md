# 🏋️‍♂️ TanaFit OS — Backend API Engine

> Production-grade, high-performance REST API powering gym management, class scheduling, attendance tracking, member billing, trainer coaching, and AI fitness assistance.

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-Client-2D3748?logo=prisma&logoColor=white)](https://prisma-client-py.readthedocs.io/)
[![Scalar](https://img.shields.io/badge/API_Docs-Scalar-8B5CF6?logo=swagger&logoColor=white)](http://127.0.0.1:8000/docs)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)

---

## ⚡ Quickstart: Running the Server

### 1. Activate Virtual Environment
```powershell
.\.venv\Scripts\Activate
```

### 2. Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### 3. Synchronize Database & Generate Prisma Client
```powershell
npx prisma migrate deploy --schema prisma\schema.prisma
$env:PATH = "$PWD\.venv\Scripts;$env:PATH"
prisma generate --schema prisma\schema.prisma
```

### 4. Start the FastAPI Development Server
```powershell
uvicorn app.main:app --reload
```

---

## 📖 Interactive Documentation Portals

The backend provides three beautiful documentation interfaces out of the box:

| Interface | URL | Description |
| :--- | :--- | :--- |
| **🟣 Scalar API Reference** | [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs) | Modern, clean interactive client with dark theme and live testing |
| **🌑 Dark Swagger UI** | [`http://127.0.0.1:8000/swagger`](http://127.0.0.1:8000/swagger) | Customized dark-themed Swagger UI with sidebar schema viewer |
| **📄 ReDoc Specification** | [`http://127.0.0.1:8000/redoc`](http://127.0.0.1:8000/redoc) | Clean 3-panel technical reference layout |
| **📋 Raw OpenAPI JSON** | [`http://127.0.0.1:8000/openapi.json`](http://127.0.0.1:8000/openapi.json) | OpenAPI 3.1.0 schema specification |
| **🩺 Service Health Check** | [`http://127.0.0.1:8000/`](http://127.0.0.1:8000/) | System runtime, environment status, and health metadata |

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

Authentication is implemented via **JSON Web Tokens (JWT)** with `HS256` signing and bcrypt password hashing.

### Configuration (`backend/.env`)
Ensure a cryptographically strong secret is configured:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
```dotenv
JWT_SECRET_KEY=your_secure_generated_key_minimum_32_bytes
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### AI Assistant Configuration

The AI endpoint uses an OpenAI-compatible chat-completions API. Add these settings
to `backend/.env` and never commit the API key:

```dotenv
OPENAI_API_KEY=your_provider_api_key
OPENAI_MODEL=gpt-4o-mini
# Optional for an OpenAI-compatible provider:
# OPENAI_BASE_URL=https://api.openai.com/v1
```

After authorizing in the API docs, open `POST /api/v1/ai/request` and use one of
these clear request bodies:

```json
{
  "request_type": "fitness_qa",
  "request_content": "How should I warm up before a leg workout?",
  "parameters": {
    "experienceLevel": "beginner",
    "goal": "muscle gain"
  }
}
```

```json
{
  "request_type": "workout_generation",
  "request_content": "Create a 3-day beginner workout plan.",
  "parameters": {
    "equipment": ["dumbbells", "bench"],
    "durationMinutes": 45
  }
}
```

Allowed request types are `fitness_qa`, `workout_generation`, and
`exercise_form`. A successful response contains the request type, generated
response, and model name. Without `OPENAI_API_KEY`, the endpoint returns a clear
`503 Service Unavailable` configuration error.

### Authorization Header
Include the Bearer token in all protected requests:
```http
Authorization: Bearer <your_jwt_token>
```

### 🛡️ Permission Matrix

| Role | Access Level & Capabilities |
| :--- | :--- |
| **👑 ADMIN** | Unrestricted access: user provisioning, revenue analytics, invoice reconciliation, system configuration. |
| **🏢 MANAGER** | Facility operations: member & trainer directories, equipment maintenance, attendance monitoring, reports. |
| **💪 TRAINER** | Class schedules, assigned client workout plans, progress entries, and coaching interactions. |
| **🏃 MEMBER** | Personal profile, class booking & check-ins, workout routine viewer, and Tana AI Assistant. |

---

## 🗺️ Complete API Surface (`/api/v1`)

### 1. Authentication & Users
- `POST /auth/register` — Public self-service member registration
- `POST /auth/login` — Authenticate with email/password (JSON or Form Data) to receive JWT
- `GET  /auth/me` — Inspect profile and permissions of authenticated user
- `POST /users/` — Provision user accounts (role-gated for privileged tiers)
- `GET  /users/` — `[ADMIN]` List and filter platform users by role

### 2. Profiles (Members, Trainers, Managers)
- `POST /members/` `GET /members/` `GET /members/{id}` `PATCH /members/{id}` — Member fitness profiles
- `POST /trainers/` `GET /trainers/` `GET /trainers/{id}` `PATCH /trainers/{id}` — Certified trainer profiles
- `POST /managers/` `GET /managers/` `GET /managers/{id}` `PATCH /managers/{id}` — Operations manager profiles

### 3. Membership Plans & Subscriptions
- `GET  /plans` — Public catalogue of active gym membership plans
- `POST /plans` `PUT /plans/{id}` `DELETE /plans/{id}` — `[ADMIN]` Manage membership plan tiers
- `POST /memberships` `GET /memberships` `GET /memberships/{id}` `PUT /memberships/{id}` — Subscription tracking

### 4. Classes, Bookings & Attendance
- `GET  /classes` `POST /classes` `GET /classes/{id}` `PUT /classes/{id}` `DELETE /classes/{id}` — Fitness classes
- `POST /classes/{id}/book` `GET /classes/{id}/bookings` `PUT /classes/{id}/bookings/{booking_id}` — Reservations
- `POST /attendance/check-in` `POST /attendance/check-out` `GET /attendance/history` — Floor attendance

### 5. Equipment & Maintenance
- `GET  /equipment` `POST /equipment` `PUT /equipment/{id}` — Facility machine inventory
- `POST /equipment/{id}/maintenance` `GET /equipment/{id}/maintenance` — Servicing & repair logs

### 6. Workouts & Progress Tracking
- `POST /workout-plans` `GET /workout-plans/{id}` `PUT /workout-plans/{id}` — Workout plans with exercise lists
- `POST /progress` `GET /progress/{member_id}` — Body weight, body fat %, performance milestones

### 7. Invoices, Payments & Admin Finance
- `POST /invoices` `GET /invoices` `GET /invoices/{id}` — Multi-item invoice generation
- `POST /invoices/{id}/pay` `GET /payments/{id}` — Customer payment processing
- `GET  /admin/stats` — `[ADMIN]` High-level platform user statistics
- `GET  /admin/payment-invoices` — `[ADMIN]` Outstanding unpaid balance ledger
- `GET  /admin/payments` `POST /admin/payments` — `[ADMIN]` Payment audit logging and manual reconciliation

### 8. Analytics & Reports
- `GET /reports/members` — Member enrollment trends and retention rates
- `GET /reports/revenue` — Financial revenue aggregated by day, week, or month
- `GET /reports/attendance` — Facility peak hours and class utilization
- `GET /reports/trainers` — Trainer session counts and performance metrics

### 9. 🤖 TanaFit AI Assistant
- `POST /ai/request` — Submit fitness prompt / question for AI workout generation or exercise advice
- `GET  /ai/requests` — Retrieve past AI conversation interactions and responses
- `GET  /ai/requests/{id}` — Fetch detailed AI response transcript and parameters

---

## 🧪 Testing

Execute the test suite with `pytest`:
```powershell
.\.venv\Scripts\python.exe -m pytest tests
```
All route definitions, schema validations, authentication boundaries, and OpenAPI contracts are verified.
