from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    TRAINER = "TRAINER"
    MEMBER = "MEMBER"


class UserCreate(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.MEMBER

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return password


class AdminProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    userId: UUID
    permissions: str | None = None
    lastLogin: datetime | None = None


class ManagerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    userId: UUID
    branch: str | None = None
    lastLogin: datetime | None = None


class TrainerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    userId: UUID
    specialization: str | None = None
    experienceYears: int | None = None
    certifications: str | None = None
    hourlyRate: float | None = None
    rating: float | None = None
    totalSessions: int | None = None
    lastLogin: datetime | None = None


class MembershipPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    price: float
    durationDays: int


class MemberMembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    plan: MembershipPlanResponse
    startDate: datetime
    endDate: datetime | None = None
    status: str
    autoRenew: bool


class MemberProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    userId: UUID
    dateOfBirth: datetime | None = None
    gender: str | None = None
    address: str | None = None
    emergencyContactName: str | None = None
    emergencyContactPhone: str | None = None
    joinDate: datetime
    membershipStatus: str
    fitnessGoals: str | None = None
    healthConditions: str | None = None
    memberships: list[MemberMembershipResponse] = Field(default_factory=list)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    fullName: str
    email: EmailStr
    phone: str | None
    role: UserRole
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    adminProfile: AdminProfileResponse | None = None
    managerProfile: ManagerProfileResponse | None = None
    trainerProfile: TrainerProfileResponse | None = None
    memberProfile: MemberProfileResponse | None = None