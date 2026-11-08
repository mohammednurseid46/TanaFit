import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.security import create_access_token, verify_password
from app.database import db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import register_member

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new member account",
    description="**[Public Endpoint]** - Self-service account registration for gym members. Accepts user details, securely hashes the password using bcrypt, and creates a default `MEMBER` profile.",
)
async def register(data: UserCreate):
    """Register a new gym member and return the created user record."""
    return await register_member(data)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get authenticated user profile",
    description="**[Authenticated Users]** - Returns the authenticated identity profile, assigned role (`ADMIN`, `MANAGER`, `TRAINER`, `MEMBER`), and activation status from the validated JWT Bearer token.",
)
async def get_me(user=Depends(get_current_user)):
    """Retrieve the profile and role details of the currently authenticated user."""
    return user


async def _read_login_credentials(request: Request) -> tuple[str, str]:
    content_type = (
        request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    )

    if content_type == "application/json":
        try:
            credentials = await request.json()
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Login body must contain valid JSON",
            ) from exc
        if not isinstance(credentials, dict):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Login body must be a JSON object",
            )
    elif content_type == "application/x-www-form-urlencoded":
        credentials = await request.form()
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Use JSON or URL-encoded form data to log in",
        )

    username = credentials.get("username") or credentials.get("email")
    password = credentials.get("password")
    if (
        not isinstance(username, str)
        or not username.strip()
        or not isinstance(password, str)
        or not password
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Login requires 'username' (or 'email') and 'password'",
        )

    return username.strip(), password


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and issue access token",
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/x-www-form-urlencoded": {
                    "schema": {
                        "type": "object",
                        "required": ["username", "password"],
                        "properties": {
                            "username": {
                                "type": "string",
                                "description": "Account email address",
                                "example": "testmember@example.com",
                            },
                            "password": {
                                "type": "string",
                                "format": "password",
                                "example": "Password123",
                            },
                        },
                    }
                },
                "application/json": {
                    "schema": {
                        "type": "object",
                        "required": ["password"],
                        "properties": {
                            "email": {"type": "string", "format": "email"},
                            "username": {"type": "string"},
                            "password": {"type": "string", "format": "password"},
                        },
                    }
                },
            },
        }
    },
    description="**[Public Endpoint]** - Accepts login credentials via either JSON payload (`email`/`username` + `password`) or standard OAuth2 URL-encoded form data. Returns a signed JWT Bearer token for subsequent authenticated requests.",
)
async def login(request: Request) -> TokenResponse:
    """Verify user credentials and issue a signed JSON Web Token (JWT)."""
    username, password = await _read_login_credentials(request)
    user = await db.user.find_unique(where={"email": username})
    if (
        user is None
        or not user.isActive
        or not verify_password(password, user.passwordHash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Incorrect email or password. In the username field, enter the "
                "email address used when creating the account."
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)
