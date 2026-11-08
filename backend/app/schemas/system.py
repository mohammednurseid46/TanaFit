from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


def _to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class SystemSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class PlanCreate(SystemSchema):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    price: Decimal = Field(ge=0)
    duration_days: int = Field(gt=0)
    benefits: str | None = None
    is_active: bool = True


class PlanUpdate(SystemSchema):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    duration_days: int | None = Field(default=None, gt=0)
    benefits: str | None = None
    is_active: bool | None = None


class MembershipCreate(SystemSchema):
    plan_id: UUID
    start_date: datetime | None = None
    auto_renew: bool = True


class MembershipUpdate(SystemSchema):
    status: str | None = Field(default=None, min_length=1)
    auto_renew: bool | None = None


class ClassCreate(SystemSchema):
    trainer_id: UUID
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    schedule_start: datetime
    schedule_end: datetime
    capacity: int = Field(gt=0)
    location: str | None = None
    status: str = "scheduled"

    @model_validator(mode="after")
    def validate_schedule(self):
        if self.schedule_end <= self.schedule_start:
            raise ValueError("schedule_end must be later than schedule_start")
        return self


class ClassUpdate(SystemSchema):
    trainer_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    schedule_start: datetime | None = None
    schedule_end: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    location: str | None = None
    status: str | None = None

    @model_validator(mode="after")
    def validate_schedule(self):
        if (
            self.schedule_start is not None
            and self.schedule_end is not None
            and self.schedule_end <= self.schedule_start
        ):
            raise ValueError("schedule_end must be later than schedule_start")
        return self


class AttendanceCreate(SystemSchema):
    member_id: UUID
    check_in: datetime | None = None
    check_out: datetime | None = None
    status: str = "present"


class AttendanceUpdate(SystemSchema):
    check_out: datetime | None = None
    status: str | None = None


class EquipmentCreate(SystemSchema):
    name: str = Field(min_length=1, max_length=120)
    category: str | None = None
    quantity: int = Field(default=1, gt=0)
    condition_status: str = "good"
    purchase_date: datetime | None = None
    warranty_end_date: datetime | None = None
    purchase_price: Decimal | None = Field(default=None, ge=0)
    location: str | None = None


class EquipmentUpdate(SystemSchema):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = None
    quantity: int | None = Field(default=None, gt=0)
    condition_status: str | None = None
    purchase_date: datetime | None = None
    warranty_end_date: datetime | None = None
    purchase_price: Decimal | None = Field(default=None, ge=0)
    location: str | None = None


class MaintenanceCreate(SystemSchema):
    maintenance_date: datetime | None = None
    description: str | None = None
    cost: Decimal | None = Field(default=None, ge=0)
    next_due_date: datetime | None = None
    status: str = "scheduled"


class ExerciseCreate(SystemSchema):
    name: str = Field(min_length=1, max_length=120)
    category: str | None = None
    sets: int | None = Field(default=None, gt=0)
    reps: int | None = Field(default=None, gt=0)
    rest_time: str | None = None
    description: str | None = None
    video_url: str | None = None
    difficulty_level: str | None = None


class WorkoutPlanCreate(SystemSchema):
    title: str = Field(min_length=1, max_length=160)
    notes: str | None = None
    goal: str | None = None
    difficulty_level: str | None = None
    duration_weeks: int | None = Field(default=None, gt=0)
    trainer_id: UUID | None = None
    exercises: list[ExerciseCreate] = Field(default_factory=list)


class WorkoutPlanUpdate(SystemSchema):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    notes: str | None = None
    goal: str | None = None
    difficulty_level: str | None = None
    duration_weeks: int | None = Field(default=None, gt=0)


class ProgressCreate(SystemSchema):
    record_date: datetime | None = None
    weight: Decimal | None = Field(default=None, gt=0)
    body_fat: Decimal | None = Field(default=None, ge=0, le=100)
    performance_score: int | None = Field(default=None, ge=0, le=100)
    summary: str | None = None
    notes: str | None = None


class InvoiceItem(SystemSchema):
    description: str = Field(min_length=1, max_length=240)
    amount: Decimal = Field(ge=0)


class InvoiceCreate(SystemSchema):
    member_id: UUID
    plan_id: UUID | None = None
    membership_id: UUID | None = None
    items: list[InvoiceItem] = Field(min_length=1)
    due_date: datetime | None = None

    @property
    def total_amount(self) -> Decimal:
        return sum((item.amount for item in self.items), start=Decimal("0"))


class PaymentCreate(SystemSchema):
    amount: Decimal = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=80)
    transaction_ref: str | None = None


class NotificationCreate(SystemSchema):
    user_ids: list[UUID] | None = None
    title: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1)
    notification_type: str = Field(min_length=1, max_length=80)


class AIRequestParameters(SystemSchema):
    experience_level: str | None = Field(
        default=None,
        description="beginner, intermediate, or advanced",
        examples=["beginner"],
    )
    goal: str | None = Field(
        default=None,
        description="Primary fitness goal",
        examples=["muscle gain"],
    )
    equipment: list[str] | None = Field(
        default=None,
        description="Equipment available for the workout",
        examples=[["dumbbells", "bench"]],
    )
    duration_minutes: int | None = Field(
        default=None,
        gt=0,
        le=240,
        description="Target workout duration in minutes",
        examples=[45],
    )


class AIRequestCreate(SystemSchema):
    request_type: Literal[
        "fitness_qa",
        "workout_generation",
        "exercise_form",
    ] = Field(
        description="AI task to perform.",
        examples=["fitness_qa"],
    )
    request_content: str = Field(
        min_length=1,
        max_length=4000,
        description="Clear fitness question or instruction for the assistant.",
        examples=["How should I warm up before a leg workout?"],
    )
    parameters: AIRequestParameters | None = None


class AIResponseResult(SystemSchema):
    request_type: str
    response: str
    model: str
