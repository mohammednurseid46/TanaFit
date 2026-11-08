from app.database import db
from app.schemas.member import MemberCreate, MemberUpdate


async def create_member(data: MemberCreate):
    return await db.memberprofile.create(data=data.model_dump(mode="json", exclude_unset=True))


async def get_all_members():
    return await db.memberprofile.find_many()


async def get_member_by_id(user_id: str):
    return await db.memberprofile.find_unique(where={"userId": user_id})


async def update_member(user_id: str, data: MemberUpdate):
    return await db.memberprofile.update(
        where={"userId": user_id},
        data=data.model_dump(mode="json", exclude_unset=True),
    )
