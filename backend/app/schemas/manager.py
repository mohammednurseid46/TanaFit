from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ManagerCreate(BaseModel):
    userId: UUID
    branch: str | None = None
    lastLogin: datetime | None = None


class ManagerUpdate(BaseModel):
    branch: str | None = None
    lastLogin: datetime | None = None


class ManagerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    userId: UUID
    branch: str | None
    lastLogin: datetime | None
