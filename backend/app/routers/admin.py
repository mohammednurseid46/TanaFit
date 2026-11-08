import asyncio
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.authorization import require_roles
from app.database import db
from app.schemas.admin import AdminPaymentCreate, AdminStatsResponse

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles("ADMIN"))],
)


@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Get global system statistics",
    description="**[Admin Only]** - Retrieve aggregate operational metrics across the gym platform, including user counts by role (Admin, Manager, Trainer, Member) and active trainer counts.",
)
async def get_admin_stats():
    """Retrieve aggregate platform metrics and user counts partitioned by role."""
    admin_count, manager_count, trainer_count, active_trainer_count, member_count = (
        await asyncio.gather(
            db.user.count(where={"role": "ADMIN"}),
            db.user.count(where={"role": "MANAGER"}),
            db.user.count(where={"role": "TRAINER"}),
            db.user.count(where={"role": "TRAINER", "isActive": True}),
            db.user.count(where={"role": "MEMBER"}),
        )
    )

    return AdminStatsResponse(
        totalUsers=admin_count + manager_count + trainer_count + member_count,
        admins=admin_count,
        managers=manager_count,
        trainers=trainer_count,
        activeTrainers=active_trainer_count,
        members=member_count,
    )


@router.get(
    "/payment-invoices",
    summary="List unpaid and partially paid invoices",
    description="**[Admin Only]** - Retrieve all outstanding gym invoices with computed unpaid balances and member details for financial reconciliation.",
)
async def list_payment_invoices():
    """Fetch all invoices with an outstanding balance for accounting and reconciliation."""
    invoices = await db.invoice.find_many(
        order={"createdAt": "desc"},
    )
    unpaid_invoices = [invoice for invoice in invoices if invoice.status != "paid"]
    if not unpaid_invoices:
        return []

    invoice_ids = [str(invoice.id) for invoice in unpaid_invoices]
    member_ids = list({str(invoice.memberId) for invoice in unpaid_invoices})
    payments = await db.payment.find_many(
        where={"invoiceId": {"in": invoice_ids}, "status": "completed"},
    )
    users = await db.user.find_many(where={"id": {"in": member_ids}})
    users_by_id = {str(user.id): user for user in users}
    paid_by_invoice: dict[str, Decimal] = {}
    for payment in payments:
        invoice_id = str(payment.invoiceId)
        paid_by_invoice[invoice_id] = (
            paid_by_invoice.get(invoice_id, Decimal("0")) + payment.amount
        )

    result = []
    for invoice in unpaid_invoices:
        invoice_id = str(invoice.id)
        remaining = invoice.totalAmount - paid_by_invoice.get(
            invoice_id, Decimal("0")
        )
        if remaining <= 0:
            continue
        member = users_by_id.get(str(invoice.memberId))
        result.append(
            {
                "id": invoice_id,
                "memberId": str(invoice.memberId),
                "memberName": member.fullName if member else "Unknown member",
                "totalAmount": str(invoice.totalAmount),
                "remainingAmount": str(remaining),
            }
        )
    return result


@router.get(
    "/payments",
    summary="List all recorded payments",
    description="**[Admin Only]** - Retrieve comprehensive payment transaction history with timestamps, methods, reference codes, and associated member accounts.",
)
async def list_admin_payments():
    """Fetch a chronological audit log of all recorded customer payments."""
    payments = await db.payment.find_many(order={"createdAt": "desc"})
    if not payments:
        return []

    member_ids = list({str(payment.memberId) for payment in payments})
    users = await db.user.find_many(where={"id": {"in": member_ids}})
    users_by_id = {str(user.id): user for user in users}

    return [
        {
            "id": str(payment.id),
            "invoiceId": str(payment.invoiceId),
            "memberId": str(payment.memberId),
            "memberName": (
                users_by_id[str(payment.memberId)].fullName
                if str(payment.memberId) in users_by_id
                else "Unknown member"
            ),
            "amount": str(payment.amount),
            "paymentMethod": payment.paymentMethod,
            "transactionRef": payment.transactionRef,
            "status": payment.status,
            "paidAt": payment.paidAt.isoformat() if payment.paidAt else None,
            "createdAt": payment.createdAt.isoformat(),
        }
        for payment in payments
    ]


@router.post(
    "/payments",
    status_code=status.HTTP_201_CREATED,
    summary="Record manual invoice payment",
    description="**[Admin Only]** - Process and record an administrative payment against an open invoice. Validates that payment amount does not exceed the remaining balance, ensures unique transaction references, and marks the invoice as paid when fully settled.",
)
async def record_admin_payment(data: AdminPaymentCreate):
    """Record a payment towards an outstanding invoice balance and update invoice status."""
    invoice_id = str(data.invoice_id)
    invoice = await db.invoice.find_unique(where={"id": invoice_id})
    if invoice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )
    if invoice.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invoice is already paid",
        )
    if data.transaction_ref and await db.payment.find_unique(
        where={"transactionRef": data.transaction_ref}
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Transaction reference has already been recorded",
        )

    completed_payments = await db.payment.find_many(
        where={"invoiceId": invoice_id, "status": "completed"},
    )
    already_paid = sum(
        (payment.amount for payment in completed_payments),
        start=Decimal("0"),
    )
    remaining = invoice.totalAmount - already_paid
    if data.amount > remaining:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payment amount exceeds the remaining invoice balance",
        )

    paid_at = datetime.now(timezone.utc)
    payment = await db.payment.create(
        data={
            "invoiceId": invoice_id,
            "memberId": str(invoice.memberId),
            "amount": data.amount,
            "paymentMethod": data.payment_method,
            "transactionRef": data.transaction_ref,
            "status": "completed",
            "paidAt": paid_at,
        }
    )
    if data.amount == remaining:
        await db.invoice.update(
            where={"id": invoice_id},
            data={"status": "paid", "paidAt": paid_at},
        )

    member = await db.user.find_unique(where={"id": str(invoice.memberId)})
    return {
        "id": str(payment.id),
        "invoiceId": invoice_id,
        "memberId": str(invoice.memberId),
        "memberName": member.fullName if member else "Unknown member",
        "amount": str(payment.amount),
        "paymentMethod": payment.paymentMethod,
        "transactionRef": payment.transactionRef,
        "status": payment.status,
        "paidAt": payment.paidAt.isoformat() if payment.paidAt else None,
        "createdAt": payment.createdAt.isoformat(),
    }
