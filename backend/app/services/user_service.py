from fastapi import HTTPException, status
from prisma.errors import UniqueViolationError

from app.database import db
from app.core.security import get_password_hash
from app.schemas.user import UserCreate, UserRole


USER_PROFILE_INCLUDE = {
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
}


async def create_user(data: UserCreate):
    user_data = data.model_dump(exclude={"password"})
    user_data["passwordHash"] = get_password_hash(data.password)
    user_data["role"] = data.role.value
    if data.role.value == "MANAGER":
        user_data["managerProfile"] = {"create": {}}
    elif data.role.value == "TRAINER":
        user_data["trainerProfile"] = {"create": {}}
    return await db.user.create(data=user_data, include=USER_PROFILE_INCLUDE)


async def register_member(data: UserCreate):
    user_data = data.model_dump(exclude={"password"})
    user_data["passwordHash"] = get_password_hash(data.password)
    user_data["role"] = "MEMBER"
    user_data["memberProfile"] = {"create": {}}
    try:
        return await db.user.create(data=user_data, include=USER_PROFILE_INCLUDE)
    except UniqueViolationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        ) from exc


async def get_all_users(role: UserRole | None = None):
    if role is None:
        return await db.user.find_many(include=USER_PROFILE_INCLUDE)
    return await db.user.find_many(
        where={"role": role.value},
        include=USER_PROFILE_INCLUDE,
    )