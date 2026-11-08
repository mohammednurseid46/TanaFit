from app.database import db
from app.schemas.manager import ManagerCreate, ManagerUpdate


async def create_manager(data: ManagerCreate):
    return await db.managerprofile.create(data=data.model_dump(mode="json", exclude_unset=True))


async def get_all_managers():
    return await db.managerprofile.find_many()


async def get_manager_by_id(user_id: str):
    return await db.managerprofile.find_unique(where={"userId": user_id})


async def update_manager(user_id: str, data: ManagerUpdate):
    return await db.managerprofile.update(
        where={"userId": user_id},
        data=data.model_dump(mode="json", exclude_unset=True),
    )
