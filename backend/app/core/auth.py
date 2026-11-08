from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.database import db
from app.core.security import ALGORITHM, get_jwt_secret_key

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def _raise_invalid_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def _load_user_from_token(token: str | None) -> Any | None:
    if token is None:
        return None

    credentials_exception = _raise_invalid_token()
    try:
        payload = jwt.decode(token, get_jwt_secret_key(), algorithms=[ALGORITHM])
    except JWTError as exc:
        raise credentials_exception from exc

    subject = payload.get("sub")
    if not isinstance(subject, str):
        raise credentials_exception

    user = await db.user.find_unique(
        where={"id": subject},
        include={
            "adminProfile": True,
            "managerProfile": True,
            "trainerProfile": True,
            "memberProfile": {
                "include": {
                    "memberships": {
                        "include": {
                            "plan": True,
                        },
                    },
                },
            },
        },
    )
    if user is None or not user.isActive:
        raise credentials_exception
    return user


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> Any:
    user = await _load_user_from_token(token)
    if user is None:
        raise _raise_invalid_token()
    return user


async def get_current_user_optional(
    token: Annotated[str | None, Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))],
) -> Any | None:
    return await _load_user_from_token(token)
