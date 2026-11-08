from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.core.authorization import require_roles, user_role
from app.schemas.trainer import TrainerCreate, TrainerResponse, TrainerUpdate
from app.services.trainer_service import (
    create_trainer,
    get_all_trainers,
    get_trainer_by_id,
    update_trainer,
)

router = APIRouter(
    prefix="/trainers",
    tags=["trainers"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "/",
    response_model=TrainerResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
    summary="Create trainer profile",
    description="**[Admin Only]** - Register a new gym trainer profile with specialty, biographical details, qualifications, and operational parameters.",
)
async def create_trainer_endpoint(data: TrainerCreate):
    """Create a certified trainer profile for an authorized user."""
    return await create_trainer(data)


@router.get(
    "/",
    response_model=list[TrainerResponse],
    summary="List all trainers",
    description="**[Public / Authenticated]** - Retrieve a roster of all gym trainers including specialties, bio, session metrics, and client ratings.",
)
async def get_all_trainers_endpoint():
    """Fetch all trainer profiles across the gym platform."""
    return await get_all_trainers()


@router.get(
    "/{user_id}",
    response_model=TrainerResponse,
    summary="Get trainer profile by user ID",
    description="**[Public / Authenticated]** - Fetch full biographical, specialization, and performance details for an individual trainer by their user UUID.",
)
async def get_trainer_endpoint(user_id: UUID):
    """Fetch a single trainer profile by user UUID."""
    trainer = await get_trainer_by_id(str(user_id))
    if trainer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")
    return trainer


@router.patch(
    "/{user_id}",
    response_model=TrainerResponse,
    summary="Update trainer profile details",
    description="**[Admin or Self (Trainer)]** - Modify trainer biography, specialization, and qualifications. Note: Only administrators can modify trainer ratings, total sessions, and administrative metrics.",
)
async def update_trainer_endpoint(
    user_id: UUID,
    data: TrainerUpdate,
    user=Depends(get_current_user),
):
    """Update trainer details with role-based restriction on metrics and ratings."""
    if user_role(user) not in {"ADMIN", "TRAINER"}:
        raise HTTPException(status_code=403, detail="You cannot update this trainer")
    if user_role(user) == "TRAINER" and str(user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Trainers can update only themselves")
    if user_role(user) == "TRAINER" and any(
        value is not None
        for value in (data.rating, data.totalSessions, data.lastLogin)
    ):
        raise HTTPException(
            status_code=403,
            detail="Only administrators can edit trainer ratings and session metrics",
        )
    trainer = await get_trainer_by_id(str(user_id))
    if trainer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer not found")
    return await update_trainer(str(user_id), data)
