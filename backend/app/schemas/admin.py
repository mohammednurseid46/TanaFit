from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.system import SystemSchema


class AdminStatsResponse(BaseModel):
    totalUsers: int
    admins: int
    managers: int
    trainers: int
    activeTrainers: int
    members: int


class AdminPaymentCreate(SystemSchema):
    invoice_id: UUID
    amount: Decimal = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=80)
    transaction_ref: str | None = None
