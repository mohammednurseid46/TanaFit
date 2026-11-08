from app.database import db
from app.schemas.trainer import TrainerCreate, TrainerUpdate


async def create_trainer(data: TrainerCreate):
    return await db.trainerprofile.create(data=data.model_dump(mode="json", exclude_unset=True))


async def get_all_trainers():
    return await db.trainerprofile.find_many()


async def get_trainer_by_id(user_id: str):
    return await db.trainerprofile.find_unique(where={"userId": user_id})


async def update_trainer(user_id: str, data: TrainerUpdate):
    return await db.trainerprofile.update(
        where={"userId": user_id},
        data=data.model_dump(mode="json", exclude_unset=True),
    )
