from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.core.authorization import require_roles, user_role
from app.schemas.manager import ManagerCreate, ManagerResponse, ManagerUpdate
from app.services.manager_service import (
    create_manager,
    get_all_managers,
    get_manager_by_id,
    update_manager,
)

router = APIRouter(
    prefix="/managers",
    tags=["managers"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "/",
    response_model=ManagerResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
    summary="Create gym manager profile",
    description="**[Admin Only]** - Create a manager profile linked to an existing user account with operational department assignments.",
)
async def create_manager_endpoint(data: ManagerCreate):
    """Create a manager profile record for an authorized user."""
    return await create_manager(data)


@router.get(
    "/",
    response_model=list[ManagerResponse],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))],
    summary="List all gym managers",
    description="**[Admin & Managers Only]** - Retrieve a complete directory of gym managers and their operational assignments.",
)
async def get_all_managers_endpoint():
    """Fetch all manager profiles across the system."""
    return await get_all_managers()


@router.get(
    "/{user_id}",
    response_model=ManagerResponse,
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))],
    summary="Get manager profile by user ID",
    description="**[Admin & Managers Only]** - Retrieve detailed information for a specific manager by their unique user UUID.",
)
async def get_manager_endpoint(user_id: UUID):
    """Fetch a single manager profile by user UUID."""
    manager = await get_manager_by_id(str(user_id))
    if manager is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manager not found")
    return manager


@router.patch(
    "/{user_id}",
    response_model=ManagerResponse,
    summary="Update manager profile details",
    description="**[Admin or Self (Manager)]** - Update contact details, operational department, and profile metadata. Managers can only modify their own profile.",
)
async def update_manager_endpoint(
    user_id: UUID,
    data: ManagerUpdate,
    user=Depends(get_current_user),
):
    """Update manager details with ownership and authorization checks."""
    if user_role(user) not in {"ADMIN", "MANAGER"}:
        raise HTTPException(status_code=403, detail="You cannot update this manager")
    if user_role(user) == "MANAGER" and str(user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Managers can update only themselves")
    manager = await get_manager_by_id(str(user_id))
    if manager is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Manager not found")
    return await update_manager(str(user_id), data)
