from typing import Any
from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.core.auth import get_current_user


def user_role(user: Any) -> str:
    return str(getattr(user.role, "value", user.role)).upper()


def require_roles(*roles: str):
    async def check_role(user: Any = Depends(get_current_user)) -> Any:
        if user_role(user) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return user

    return check_role


def ensure_member_access(user: Any, member_id: UUID | str) -> None:
    role = user_role(user)
    if role == "MEMBER" and str(user.id) != str(member_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members can access only their own records",
        )
    if role not in {"ADMIN", "MANAGER", "MEMBER"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this member",
        )
