from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user, get_current_user_optional
from app.core.authorization import require_roles
from app.schemas.user import UserCreate, UserResponse, UserRole
from app.services.user_service import create_user, get_all_users

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Provision a user account",
    description="Create a user account in the system. Unauthenticated requests can register regular `MEMBER` accounts. Creating privileged accounts (`ADMIN`, `MANAGER`, `TRAINER`) requires appropriate administrative credentials.",
)
async def create_user_endpoint(
    data: UserCreate,
    current_user=Depends(get_current_user_optional),
):
    """Create a new user record with role-based provisioning permissions."""
    if current_user is not None:
        role = str(getattr(current_user.role, "value", current_user.role)).upper()
        if data.role.value == "MANAGER" and role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create managers",
            )
        if data.role.value == "TRAINER" and role not in {"ADMIN", "MANAGER"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators and managers can create trainers",
            )
        if data.role.value == "ADMIN" and role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create administrators",
            )
    return await create_user(data)


@router.get(
    "/",
    response_model=list[UserResponse],
    dependencies=[Depends(require_roles("ADMIN"))],
    summary="List and filter user accounts",
    description="**[Admin Only]** - Retrieve a complete list of registered users with optional filtering by role (`ADMIN`, `MANAGER`, `TRAINER`, `MEMBER`).",
)
async def get_all_users_endpoint(role: UserRole | None = None):
    """Retrieve a list of all registered platform users with optional role filter."""
    return await get_all_users(role)
