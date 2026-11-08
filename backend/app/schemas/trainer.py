from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TrainerCreate(BaseModel):
    userId: UUID
    specialization: str | None = None
    experienceYears: int | None = None
    certifications: str | None = None
    hourlyRate: Decimal | None = None
    rating: Decimal | None = None
    totalSessions: int | None = None
    lastLogin: datetime | None = None


class TrainerUpdate(BaseModel):
    specialization: str | None = None
    experienceYears: int | None = None
    certifications: str | None = None
    hourlyRate: Decimal | None = None
    rating: Decimal | None = None
    totalSessions: int | None = None
    lastLogin: datetime | None = None


class TrainerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    userId: UUID
    specialization: str | None
    experienceYears: int | None
    certifications: str | None
    hourlyRate: Decimal | None
    rating: Decimal | None
    totalSessions: int | None
    lastLogin: datetime | None
