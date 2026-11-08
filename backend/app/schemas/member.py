from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MemberCreate(BaseModel):
    userId: UUID
    dateOfBirth: datetime | None = None
    gender: str | None = None
    address: str | None = None
    emergencyContactName: str | None = None
    emergencyContactPhone: str | None = None
    membershipStatus: str = "active"
    fitnessGoals: str | None = None
    healthConditions: str | None = None


class MemberUpdate(BaseModel):
    dateOfBirth: datetime | None = None
    gender: str | None = None
    address: str | None = None
    emergencyContactName: str | None = None
    emergencyContactPhone: str | None = None
    membershipStatus: str | None = None
    fitnessGoals: str | None = None
    healthConditions: str | None = None


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    userId: UUID
    dateOfBirth: datetime | None
    gender: str | None
    address: str | None
    emergencyContactName: str | None
    emergencyContactPhone: str | None
    joinDate: datetime
    membershipStatus: str
    fitnessGoals: str | None
    healthConditions: str | None
