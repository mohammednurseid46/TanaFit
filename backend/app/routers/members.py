from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.core.authorization import ensure_member_access, require_roles, user_role
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.services.member_service import (
    create_member,
    get_all_members,
    get_member_by_id,
    update_member,
)

router = APIRouter(
    prefix="/members",
    tags=["members"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "/",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
    summary="Create member profile",
    description="**[Admin Only]** - Provision a comprehensive member profile linked to an existing user record with fitness goals, date of birth, emergency contact, and address.",
)
async def create_member_endpoint(data: MemberCreate):
    """Create a member profile for an existing user account."""
    return await create_member(data)


@router.get(
    "/",
    response_model=list[MemberResponse],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))],
    summary="List all member profiles",
    description="**[Admin & Managers Only]** - Retrieve all registered member profiles with fitness goals, contact information, and membership statuses.",
)
async def get_all_members_endpoint():
    """Fetch all gym member profiles across the system."""
    return await get_all_members()


@router.get(
    "/{user_id}",
    response_model=MemberResponse,
    summary="Get member profile by user ID",
    description="**[Admin, Manager, or Self (Member)]** - Retrieve full profile details for a specific member by their user UUID.",
)
async def get_member_endpoint(
    user_id: UUID,
    user=Depends(get_current_user),
):
    """Fetch a single member profile by user UUID with ownership verification."""
    if user_role(user) not in {"ADMIN", "MANAGER", "MEMBER"}:
        raise HTTPException(status_code=403, detail="You cannot access this member")
    ensure_member_access(user, user_id)
    member = await get_member_by_id(str(user_id))
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return member


@router.patch(
    "/{user_id}",
    response_model=MemberResponse,
    summary="Update member profile details",
    description="**[Admin or Self (Member)]** - Update fitness goals, emergency contact info, and medical disclosures. Note: Regular members cannot alter their own `membershipStatus`.",
)
async def update_member_endpoint(
    user_id: UUID,
    data: MemberUpdate,
    user=Depends(get_current_user),
):
    """Update member profile with role-based field restrictions."""
    if user_role(user) not in {"ADMIN", "MEMBER"}:
        raise HTTPException(status_code=403, detail="You cannot update this member")
    ensure_member_access(user, user_id)
    if user_role(user) == "MEMBER" and data.membershipStatus is not None:
        raise HTTPException(
            status_code=403,
            detail="Members cannot change their own membership status",
        )
    member = await get_member_by_id(str(user_id))
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return await update_member(str(user_id), data)
