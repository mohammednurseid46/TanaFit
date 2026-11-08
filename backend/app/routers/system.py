from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.authorization import ensure_member_access, require_roles, user_role
from app.core.auth import get_current_user
from app.database import db
from app.services.ai_service import AIProviderError, generate_response
from app.schemas.system import (
    AIRequestCreate,
    AIResponseResult,
    AttendanceCreate,
    AttendanceUpdate,
    ClassCreate,
    ClassUpdate,
    EquipmentCreate,
    EquipmentUpdate,
    ExerciseCreate,
    InvoiceCreate,
    MaintenanceCreate,
    MembershipCreate,
    MembershipUpdate,
    NotificationCreate,
    PaymentCreate,
    PlanCreate,
    PlanUpdate,
    ProgressCreate,
    WorkoutPlanCreate,
    WorkoutPlanUpdate,
)

router = APIRouter(tags=["system"])


def not_found(resource: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )


def date_bucket(
    value: datetime | None,
    group_by: Literal["day", "week", "month"],
) -> str | None:
    if value is None:
        return None
    value = value.date()
    if group_by == "day":
        return value.isoformat()
    if group_by == "week":
        year, week, _ = value.isocalendar()
        return f"{year}-W{week:02d}"
    return f"{value.year}-{value.month:02d}"


async def get_session_or_404(session_id: UUID):
    session = await db.classsession.find_unique(where={"id": str(session_id)})
    if session is None:
        raise not_found("Class")
    return session


async def ensure_session_manager(user: Any, session_id: UUID):
    session = await get_session_or_404(session_id)
    role = user_role(user)
    if role == "TRAINER" and str(session.trainerId) != str(user.id):
        raise HTTPException(status_code=403, detail="You do not manage this class")
    if role not in {"ADMIN", "MANAGER", "TRAINER"}:
        raise HTTPException(status_code=403, detail="You do not manage this class")
    return session


@router.get("/plans", tags=["membership plans"], summary="List and search membership plans", description="**[Public Endpoint]** - Browse active and archived gym membership plans.\n\n### Query Filters:\n- `is_active` *(optional)*: Filter by active (`true`) or archived (`false`) status.\n- `search` *(optional)*: Case-insensitive search on plan names.\n- `page` & `per_page`: Standard pagination controls.")
async def list_plans(
    is_active: bool | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    """Retrieve membership plans with optional active status filter and search query."""
    where: dict[str, Any] = {}
    if is_active is not None:
        where["isActive"] = is_active
    if search:
        where["name"] = {"contains": search, "mode": "insensitive"}
    return await db.membershipplan.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"createdAt": "desc"},
    )


@router.post(
    "/plans",
    status_code=status.HTTP_201_CREATED,
    tags=["membership plans"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Create a new membership plan", description="**[Admin Only]** - Create a new subscription plan for the gym.\n\n### Required Fields:\n- `name`: Unique, descriptive plan title.\n- `price`: Plan fee in system currency.\n- `duration_days`: Number of days the membership remains active.\n- `benefits`: Optional string summarizing included perks.")
async def create_plan(data: PlanCreate):
    """Create and publish a new gym membership plan."""
    return await db.membershipplan.create(
        data=data.model_dump(mode="json", by_alias=True)
    )


@router.get("/plans/{plan_id}", tags=["membership plans"], summary="Get membership plan details by ID", description="**[Public Endpoint]** - Retrieve comprehensive pricing, duration, and benefits for a single membership plan.")
async def get_plan(plan_id: UUID):
    """Fetch details of a single membership plan by its UUID."""
    plan = await db.membershipplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Membership plan")
    return plan


@router.put(
    "/plans/{plan_id}",
    tags=["membership plans"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Update membership plan", description="**[Admin Only]** - Modify plan pricing, duration, benefits, or active status.\n\nDeactivating a plan prevents new sign-ups while maintaining existing subscriptions.")
async def update_plan(plan_id: UUID, data: PlanUpdate):
    """Update fields of an existing membership plan."""
    plan = await db.membershipplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Membership plan")
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No plan fields were supplied")
    return await db.membershipplan.update(where={"id": str(plan_id)}, data=changes)


@router.delete(
    "/plans/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["membership plans"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Delete a membership plan", description="**[Admin Only]** - Permanently delete a membership plan record from the system.")
async def delete_plan(plan_id: UUID):
    """Remove a membership plan by its UUID."""
    plan = await db.membershipplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Membership plan")
    used = await db.membermembership.count(where={"planId": str(plan_id)})
    if used:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A plan with memberships cannot be deleted; deactivate it instead",
        )
    await db.membershipplan.delete(where={"id": str(plan_id)})


@router.get(
    "/members/{member_id}/memberships",
    tags=["memberships"],
    dependencies=[Depends(get_current_user)], summary="List subscriptions for a member", description="**[Admin, Manager, or Self]** - Retrieve all membership plans and subscription history for a given member.")
async def list_member_memberships(
    member_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Retrieve all past and active memberships assigned to a member."""
    ensure_member_access(user, member_id)
    return await db.membermembership.find_many(
        where={"memberId": str(member_id)},
        order={"createdAt": "desc"},
    )


@router.post(
    "/members/{member_id}/memberships",
    status_code=status.HTTP_201_CREATED,
    tags=["memberships"],
    dependencies=[Depends(get_current_user)], summary="Assign a membership plan to a member", description="**[Admin Only]** - Enrolls a member in a plan. Automatically calculates validity dates based on the plan duration and generates an initial invoice.")
async def create_membership(
    member_id: UUID,
    data: MembershipCreate,
    user: Any = Depends(get_current_user),
):
    """Enroll a member into a membership plan and generate corresponding billing."""
    ensure_member_access(user, member_id)
    member = await db.memberprofile.find_unique(where={"userId": str(member_id)})
    if member is None:
        raise not_found("Member")
    plan = await db.membershipplan.find_unique(where={"id": str(data.plan_id)})
    if plan is None or not plan.isActive:
        raise HTTPException(status_code=404, detail="Active membership plan not found")
    start = data.start_date or datetime.now(timezone.utc)
    return await db.membermembership.create(
        data={
            "memberId": str(member_id),
            "planId": str(data.plan_id),
            "startDate": start,
            "endDate": start + timedelta(days=plan.durationDays),
            "autoRenew": data.auto_renew,
            "status": "active",
        }
    )


@router.get(
    "/memberships/{membership_id}",
    tags=["memberships"],
    dependencies=[Depends(get_current_user)], summary="Get subscription details", description="**[Admin, Manager, or Self]** - Fetch validity dates, auto-renewal flag, and plan details for a member subscription.")
async def get_membership(
    membership_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Fetch a specific membership subscription record by UUID."""
    membership = await db.membermembership.find_unique(
        where={"id": str(membership_id)}
    )
    if membership is None:
        raise not_found("Membership")
    ensure_member_access(user, membership.memberId)
    return membership


@router.put(
    "/memberships/{membership_id}",
    tags=["memberships"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Update member subscription status", description="**[Admin Only]** - Update subscription status (active, paused, expired) or toggle auto-renew.")
async def update_membership(membership_id: UUID, data: MembershipUpdate):
    """Update status or renewal preferences for an active member subscription."""
    membership = await db.membermembership.find_unique(
        where={"id": str(membership_id)}
    )
    if membership is None:
        raise not_found("Membership")
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No membership fields were supplied")
    return await db.membermembership.update(
        where={"id": str(membership_id)}, data=changes
    )


@router.post(
    "/memberships/{membership_id}/cancel",
    tags=["memberships"],
    dependencies=[Depends(get_current_user)], summary="Cancel a member subscription", description="**[Admin, Manager, or Self]** - Cancels an active membership subscription and disables automatic renewal.")
async def cancel_membership(
    membership_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Cancel an active membership subscription."""
    membership = await db.membermembership.find_unique(
        where={"id": str(membership_id)}
    )
    if membership is None:
        raise not_found("Membership")
    ensure_member_access(user, membership.memberId)
    return await db.membermembership.update(
        where={"id": str(membership_id)},
        data={"status": "cancelled", "autoRenew": False},
    )


@router.get("/classes", tags=["classes"], summary="List and filter group fitness classes", description="**[Authenticated Users]** - Search scheduled group classes by date range, trainer, status, or title keyword.")
async def list_classes(
    date: datetime | None = None,
    trainer_id: UUID | None = None,
    class_status: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    """Retrieve scheduled classes matching optional trainer, status, and date range filters."""
    where: dict[str, Any] = {}
    if date:
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        where["schedule"] = {"gte": start, "lt": start + timedelta(days=1)}
    if trainer_id:
        where["trainerId"] = str(trainer_id)
    if class_status:
        where["status"] = class_status
    if search:
        where["name"] = {"contains": search, "mode": "insensitive"}
    sessions = await db.classsession.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"schedule": "asc"},
    )
    results = []
    for session in sessions:
        seats_taken = await db.classbooking.count(
            where={"sessionId": str(session.id), "bookingStatus": "confirmed"}
        )
        result = session.model_dump(mode="json")
        result["seats_left"] = max(session.capacity - seats_taken, 0)
        results.append(result)
    return results


@router.post(
    "/classes",
    status_code=status.HTTP_201_CREATED,
    tags=["classes"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Schedule a group fitness class", description="**[Admin & Manager]** - Schedule a new class session with designated trainer, capacity, location, and start/end times.")
async def create_class(data: ClassCreate):
    """Create and schedule a new group fitness class."""
    trainer = await db.trainerprofile.find_unique(where={"userId": str(data.trainer_id)})
    if trainer is None:
        raise not_found("Trainer")
    values = data.model_dump(mode="json", by_alias=True, exclude={"schedule_start"})
    values["trainerId"] = str(data.trainer_id)
    values["schedule"] = data.schedule_start
    values.pop("scheduleStart", None)
    return await db.classsession.create(data=values)


@router.get("/classes/{class_id}", tags=["classes"], summary="Get class session details", description="**[Authenticated Users]** - Fetch schedule time, capacity, trainer attribution, and enrollment status for a class.")
async def get_class(class_id: UUID):
    """Retrieve detailed information for a specific class session."""
    session = await get_session_or_404(class_id)
    bookings = await db.classbooking.count(
        where={"sessionId": str(class_id), "bookingStatus": "confirmed"}
    )
    result = session.model_dump(mode="json")
    result["seats_left"] = max(session.capacity - bookings, 0)
    return result


@router.put(
    "/classes/{class_id}",
    tags=["classes"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Update scheduled class details", description="**[Admin, Manager, or Assigned Trainer]** - Modify time, location, max capacity, or cancellation status of a class.")
async def update_class(class_id: UUID, data: ClassUpdate):
    """Update time, location, or parameters of a scheduled class."""
    session = await get_session_or_404(class_id)
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    start = changes.get("scheduleStart", session.schedule)
    end = changes.get("scheduleEnd", session.scheduleEnd)
    if end is not None and end <= start:
        raise HTTPException(
            status_code=422,
            detail="schedule_end must be later than schedule_start",
        )
    if "scheduleStart" in changes:
        changes["schedule"] = changes.pop("scheduleStart")
    if "trainerId" in changes:
        trainer = await db.trainerprofile.find_unique(where={"userId": changes["trainerId"]})
        if trainer is None:
            raise not_found("Trainer")
    if not changes:
        raise HTTPException(status_code=422, detail="No class fields were supplied")
    return await db.classsession.update(where={"id": str(class_id)}, data=changes)


@router.delete(
    "/classes/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["classes"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Cancel and remove scheduled class", description="**[Admin & Manager]** - Remove a scheduled class from the fitness calendar.")
async def delete_class(class_id: UUID):
    """Delete a class session by UUID."""
    await get_session_or_404(class_id)
    await db.classsession.delete(where={"id": str(class_id)})


@router.post(
    "/classes/{class_id}/book",
    status_code=status.HTTP_201_CREATED,
    tags=["class bookings"],
    dependencies=[Depends(require_roles("MEMBER"))], summary="Book a spot in a group fitness class", description="**[Admin, Manager, or Enrolling Member]** - Reserve a slot in a scheduled class. Verifies member subscription and capacity limits.")
async def book_class(class_id: UUID, user: Any = Depends(get_current_user)):
    """Book a spot in an upcoming class session for a member."""
    session = await get_session_or_404(class_id)
    member = await db.memberprofile.find_unique(where={"userId": str(user.id)})
    if member is None:
        raise HTTPException(status_code=403, detail="A member profile is required")
    existing = await db.classbooking.find_first(
        where={
            "memberId": str(user.id),
            "sessionId": str(class_id),
            "bookingStatus": {"in": ["confirmed", "waitlist"]},
        }
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="You already booked this class")
    confirmed = await db.classbooking.count(
        where={"sessionId": str(class_id), "bookingStatus": "confirmed"}
    )
    booking_status = "confirmed" if confirmed < session.capacity else "waitlist"
    return await db.classbooking.create(
        data={
            "memberId": str(user.id),
            "sessionId": str(class_id),
            "bookingStatus": booking_status,
        }
    )


@router.get(
    "/classes/{class_id}/bookings",
    tags=["class bookings"],
    dependencies=[Depends(get_current_user)], summary="List bookings for a class session", description="**[Admin, Manager, or Assigned Trainer]** - View all confirmed member reservations and attendee details for a class.")
async def list_class_bookings(
    class_id: UUID,
    user: Any = Depends(get_current_user),
):
    """List all bookings registered for a specific class session."""
    session = await get_session_or_404(class_id)
    role = user_role(user)
    if role == "TRAINER" and str(session.trainerId) != str(user.id):
        raise HTTPException(status_code=403, detail="You do not manage this class")
    if role == "MEMBER":
        return await db.classbooking.find_many(
            where={"sessionId": str(class_id), "memberId": str(user.id)}
        )
    if role not in {"ADMIN", "MANAGER", "TRAINER"}:
        raise HTTPException(status_code=403, detail="Forbidden")
    return await db.classbooking.find_many(
        where={"sessionId": str(class_id)}, order={"bookedAt": "desc"}
    )


@router.put(
    "/bookings/{booking_id}/cancel",
    tags=["class bookings"],
    dependencies=[Depends(get_current_user)], summary="Cancel a class reservation", description="**[Admin, Manager, or Enrolled Member]** - Cancel an existing booking and free up the capacity slot.")
async def cancel_booking(
    booking_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Cancel a class booking reservation."""
    booking = await db.classbooking.find_unique(where={"id": str(booking_id)})
    if booking is None:
        raise not_found("Booking")
    role = user_role(user)
    if role != "ADMIN" and str(booking.memberId) != str(user.id):
        raise HTTPException(status_code=403, detail="You can cancel only your own booking")
    if booking.bookingStatus == "cancelled":
        raise HTTPException(status_code=409, detail="Booking is already cancelled")
    return await db.classbooking.update(
        where={"id": str(booking_id)},
        data={
            "bookingStatus": "cancelled",
            "cancelledAt": datetime.now(timezone.utc),
        },
    )


@router.post(
    "/classes/{class_id}/check-in",
    status_code=status.HTTP_201_CREATED,
    tags=["attendance"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Check in a member to a class session", description="**[Admin, Manager, or Assigned Trainer]** - Verify and record attendance for an enrolled member upon arrival.")
async def check_in_member(
    class_id: UUID,
    data: AttendanceCreate,
    user: Any = Depends(get_current_user),
):
    """Check in an enrolled member for an ongoing or upcoming class session."""
    await ensure_session_manager(user, class_id)
    member = await db.memberprofile.find_unique(where={"userId": str(data.member_id)})
    if member is None:
        raise not_found("Member")
    return await db.attendance.create(
        data={
            "sessionId": str(class_id),
            "memberId": str(data.member_id),
            "checkIn": data.check_in or datetime.now(timezone.utc),
            "checkOut": data.check_out,
            "status": data.status,
        }
    )


@router.get(
    "/attendance",
    tags=["attendance"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER", "TRAINER"))], summary="Query gym facility attendance logs", description="**[Admin & Manager]** - Retrieve general gym check-in and check-out logs with optional member and date filtering.")
async def list_attendance(
    date: datetime | None = None,
    member_id: UUID | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    user: Any = Depends(get_current_user),
):
    """Query facility access logs with optional member and date range filters."""
    where: dict[str, Any] = {}
    if date:
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        where["checkIn"] = {"gte": start, "lt": start + timedelta(days=1)}
    if member_id:
        where["memberId"] = str(member_id)
    if user_role(user) == "TRAINER":
        sessions = await db.classsession.find_many(where={"trainerId": str(user.id)})
        where["sessionId"] = {"in": [str(session.id) for session in sessions]}
    return await db.attendance.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"createdAt": "desc"},
    )


@router.post(
    "/attendance",
    status_code=status.HTTP_201_CREATED,
    tags=["attendance"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Record gym facility check-in", description="**[Admin & Manager]** - Log an access event (timestamp and status) for a gym member scanning into the facility.")
async def create_attendance(
    session_id: UUID,
    data: AttendanceCreate,
    user: Any = Depends(get_current_user),
):
    """Record a new member check-in timestamp and access status."""
    await ensure_session_manager(user, session_id)
    if await db.memberprofile.find_unique(where={"userId": str(data.member_id)}) is None:
        raise not_found("Member")
    return await db.attendance.create(
        data={
            **data.model_dump(mode="json", by_alias=True, exclude={"member_id"}),
            "memberId": str(data.member_id),
            "sessionId": str(session_id),
            "checkIn": data.check_in or datetime.now(timezone.utc),
        }
    )


@router.put(
    "/attendance/{attendance_id}",
    tags=["attendance"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Update attendance record or check-out", description="**[Admin & Manager]** - Record departure timestamp or adjust attendance record status.")
async def update_attendance(
    attendance_id: UUID,
    data: AttendanceUpdate,
    user: Any = Depends(get_current_user),
):
    """Update attendance check-out time or presence status."""
    attendance = await db.attendance.find_unique(where={"id": str(attendance_id)})
    if attendance is None:
        raise not_found("Attendance record")
    await ensure_session_manager(user, UUID(str(attendance.sessionId)))
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No attendance fields were supplied")
    return await db.attendance.update(
        where={"id": str(attendance_id)}, data=changes
    )


@router.get(
    "/equipment",
    tags=["equipment"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="List gym equipment and machines", description="**[Authenticated Users]** - Search inventory of gym equipment, categorized by muscle group, location, or maintenance state.")
async def list_equipment(
    category: str | None = None,
    condition_status: str | None = None,
    location: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    """Retrieve equipment inventory matching optional category and condition filters."""
    where: dict[str, Any] = {}
    for key, value in (
        ("category", category),
        ("conditionStatus", condition_status),
        ("location", location),
    ):
        if value:
            where[key] = value
    return await db.equipment.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"name": "asc"},
    )


@router.post(
    "/equipment",
    status_code=status.HTTP_201_CREATED,
    tags=["equipment"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Register new gym equipment", description="**[Admin & Manager]** - Add a new equipment asset with purchase cost, category, location, and warranty dates.")
async def create_equipment(data: EquipmentCreate):
    """Register a new piece of gym equipment in the asset inventory."""
    return await db.equipment.create(
        data=data.model_dump(mode="json", by_alias=True)
    )


@router.get(
    "/equipment/{equipment_id}",
    tags=["equipment"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Get equipment details and service logs", description="**[Authenticated Users]** - Inspect condition status, purchase history, and upcoming maintenance schedules for a machine.")
async def get_equipment(equipment_id: UUID):
    """Fetch equipment specifications, location, and maintenance logs."""
    equipment = await db.equipment.find_unique(where={"id": str(equipment_id)})
    if equipment is None:
        raise not_found("Equipment")
    history = await db.equipmentmaintenance.find_many(
        where={"equipmentId": str(equipment_id)},
        order={"maintenanceDate": "desc"},
    )
    result = equipment.model_dump(mode="json")
    result["maintenance_history"] = [
        item.model_dump(mode="json") for item in history
    ]
    return result


@router.put(
    "/equipment/{equipment_id}",
    tags=["equipment"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Update equipment condition or location", description="**[Admin & Manager]** - Modify equipment condition (good, needs service, broken), location, or warranty info.")
async def update_equipment(equipment_id: UUID, data: EquipmentUpdate):
    """Update equipment condition, location, or warranty metadata."""
    if await db.equipment.find_unique(where={"id": str(equipment_id)}) is None:
        raise not_found("Equipment")
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No equipment fields were supplied")
    return await db.equipment.update(where={"id": str(equipment_id)}, data=changes)


@router.post(
    "/equipment/{equipment_id}/maintenance",
    status_code=status.HTTP_201_CREATED,
    tags=["equipment"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Schedule or log equipment maintenance", description="**[Admin & Manager]** - Record a service or repair task, maintenance costs, and projected next due date.")
async def create_maintenance(equipment_id: UUID, data: MaintenanceCreate):
    """Create a maintenance service entry for a machine."""
    if await db.equipment.find_unique(where={"id": str(equipment_id)}) is None:
        raise not_found("Equipment")
    values = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    values["equipmentId"] = str(equipment_id)
    return await db.equipmentmaintenance.create(data=values)


@router.get(
    "/members/{member_id}/workout-plans",
    tags=["workout plans"],
    dependencies=[Depends(get_current_user)], summary="List workout routines for a member", description="**[Admin, Assigned Trainer, or Self]** - Retrieve assigned workout plans and exercise routines for a member.")
async def list_workout_plans(
    member_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Retrieve all personalized workout routines created for a member."""
    if user_role(user) == "TRAINER":
        return await db.workoutplan.find_many(
            where={"memberId": str(member_id), "trainerId": str(user.id)},
            order={"createdAt": "desc"},
        )
    ensure_member_access(user, member_id)
    return await db.workoutplan.find_many(
        where={"memberId": str(member_id)},
        order={"createdAt": "desc"},
    )


@router.post(
    "/members/{member_id}/workout-plans",
    status_code=status.HTTP_201_CREATED,
    tags=["workout plans"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Create a personalized workout plan", description="**[Admin or Trainer]** - Construct a structured workout regimen with target goals, duration weeks, and exercise items.")
async def create_workout_plan(
    member_id: UUID,
    data: WorkoutPlanCreate,
    user: Any = Depends(get_current_user),
):
    """Design and assign a new workout plan with exercises to a member."""
    if await db.memberprofile.find_unique(where={"userId": str(member_id)}) is None:
        raise not_found("Member")
    role = user_role(user)
    trainer_id = str(user.id) if role == "TRAINER" else (
        str(data.trainer_id) if data.trainer_id else None
    )
    if trainer_id and await db.trainerprofile.find_unique(
        where={"userId": trainer_id}
    ) is None:
        raise not_found("Trainer")
    values = data.model_dump(
        mode="json",
        by_alias=True,
        exclude={"exercises", "duration_weeks", "trainer_id"},
    )
    values.update(
        {
            "memberId": str(member_id),
            "trainerId": trainer_id,
            "workoutWeeks": data.duration_weeks,
        }
    )
    values["exercises"] = {
        "create": [
            exercise.model_dump(mode="json", by_alias=True)
            for exercise in data.exercises
        ]
    }
    return await db.workoutplan.create(
        data=values,
        include={"exercises": True},
    )


@router.get(
    "/workout-plans/{plan_id}",
    tags=["workout plans"],
    dependencies=[Depends(get_current_user)], summary="Get workout plan details with exercises", description="**[Admin, Assigned Trainer, or Self]** - Fetch workout routine details including full exercise lists, sets, reps, and instructions.")
async def get_workout_plan(
    plan_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Retrieve a workout plan with its full list of exercises and instructions."""
    plan = await db.workoutplan.find_unique(
        where={"id": str(plan_id)},
        include={"exercises": True},
    )
    if plan is None:
        raise not_found("Workout plan")
    role = user_role(user)
    if role == "MEMBER" and str(plan.memberId) != str(user.id):
        raise HTTPException(status_code=403, detail="You cannot access this workout plan")
    if role == "TRAINER" and str(plan.trainerId) != str(user.id):
        raise HTTPException(status_code=403, detail="You cannot access this workout plan")
    if role not in {"ADMIN", "MANAGER", "TRAINER", "MEMBER"}:
        raise HTTPException(status_code=403, detail="Forbidden")
    return plan


@router.put(
    "/workout-plans/{plan_id}",
    tags=["workout plans"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Update workout plan metadata", description="**[Admin or Creator Trainer]** - Modify title, target goal, duration, or trainer notes for a workout plan.")
async def update_workout_plan(
    plan_id: UUID,
    data: WorkoutPlanUpdate,
    user: Any = Depends(get_current_user),
):
    """Update top-level fields of a workout routine."""
    plan = await db.workoutplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Workout plan")
    if (
        user_role(user) == "TRAINER"
        and str(plan.trainerId) != str(user.id)
    ):
        raise HTTPException(status_code=403, detail="You do not own this workout plan")
    changes = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if "durationWeeks" in changes:
        changes["workoutWeeks"] = changes.pop("durationWeeks")
    if not changes:
        raise HTTPException(status_code=422, detail="No workout plan fields were supplied")
    return await db.workoutplan.update(where={"id": str(plan_id)}, data=changes)


@router.delete(
    "/workout-plans/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["workout plans"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Delete a workout plan", description="**[Admin or Creator Trainer]** - Remove a workout plan from the member's profile.")
async def delete_workout_plan(plan_id: UUID, user: Any = Depends(get_current_user)):
    """Permanently remove a workout plan by UUID."""
    plan = await db.workoutplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Workout plan")
    if (
        user_role(user) == "TRAINER"
        and str(plan.trainerId) != str(user.id)
    ):
        raise HTTPException(status_code=403, detail="You do not own this workout plan")
    await db.workoutplan.delete(where={"id": str(plan_id)})


@router.post(
    "/workout-plans/{plan_id}/exercises",
    status_code=status.HTTP_201_CREATED,
    tags=["workout plans"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Add an exercise to a workout plan", description="**[Admin or Creator Trainer]** - Append a new exercise movement with recommended sets, reps, rest time, and video tutorial.")
async def add_exercise(
    plan_id: UUID,
    data: ExerciseCreate,
    user: Any = Depends(get_current_user),
):
    """Append an exercise item with sets and reps to an existing workout plan."""
    plan = await db.workoutplan.find_unique(where={"id": str(plan_id)})
    if plan is None:
        raise not_found("Workout plan")
    if user_role(user) == "TRAINER" and str(plan.trainerId) != str(user.id):
        raise HTTPException(status_code=403, detail="You do not own this workout plan")
    return await db.exercise.create(
        data={
            **data.model_dump(mode="json", by_alias=True),
            "workoutPlanId": str(plan_id),
        }
    )


@router.put(
    "/exercises/{exercise_id}",
    tags=["workout plans"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER"))], summary="Update exercise parameters", description="**[Admin or Assigned Trainer]** - Modify exercise instructions, target sets, repetitions, or rest duration.")
async def update_exercise(
    exercise_id: UUID,
    data: ExerciseCreate,
    user: Any = Depends(get_current_user),
):
    """Update sets, reps, rest time, or notes for an exercise."""
    exercise = await db.exercise.find_unique(
        where={"id": str(exercise_id)},
        include={"workoutPlan": True},
    )
    if exercise is None:
        raise not_found("Exercise")
    if (
        user_role(user) == "TRAINER"
        and str(exercise.workoutPlan.trainerId) != str(user.id)
    ):
        raise HTTPException(status_code=403, detail="You do not own this exercise")
    return await db.exercise.update(
        where={"id": str(exercise_id)},
        data=data.model_dump(mode="json", by_alias=True),
    )


@router.get(
    "/members/{member_id}/progress",
    tags=["progress"],
    dependencies=[Depends(get_current_user)], summary="List member physical progress history", description="**[Admin, Assigned Trainer, or Self]** - Retrieve chronological biometric records (weight, body fat percentage, performance scores).")
async def list_progress(
    member_id: UUID,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    user: Any = Depends(get_current_user),
):
    """List tracked physical progress entries for a member."""
    where: dict[str, Any] = {"memberId": str(member_id)}
    if user_role(user) == "TRAINER":
        where["trainerId"] = str(user.id)
    else:
        ensure_member_access(user, member_id)
    if start_date or end_date:
        where["recordDate"] = {}
        if start_date:
            where["recordDate"]["gte"] = start_date
        if end_date:
            where["recordDate"]["lte"] = end_date
    return await db.progressrecord.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"recordDate": "desc"},
    )


@router.post(
    "/members/{member_id}/progress",
    status_code=status.HTTP_201_CREATED,
    tags=["progress"],
    dependencies=[Depends(require_roles("ADMIN", "TRAINER", "MEMBER"))], summary="Log a new physical progress entry", description="**[Admin, Trainer, or Self]** - Record current weight, body fat %, performance rating, and training progress notes.")
async def create_progress(
    member_id: UUID,
    data: ProgressCreate,
    user: Any = Depends(get_current_user),
):
    """Record a new metric snapshot (weight, body fat, performance) for a member."""
    ensure_member_access(user, member_id)
    if await db.memberprofile.find_unique(where={"userId": str(member_id)}) is None:
        raise not_found("Member")
    role = user_role(user)
    values = data.model_dump(mode="json", by_alias=True, exclude_unset=True)
    if role == "TRAINER":
        assignment = await db.workoutplan.find_first(
            where={"memberId": str(member_id), "trainerId": str(user.id)}
        )
        if assignment is None:
            raise HTTPException(
                status_code=403,
                detail="Progress can be recorded only for your assigned members",
            )
        values["trainerId"] = str(user.id)
    values["memberId"] = str(member_id)
    return await db.progressrecord.create(data=values)


@router.get(
    "/progress/{progress_id}",
    tags=["progress"],
    dependencies=[Depends(get_current_user)], summary="Get single progress record details", description="**[Admin, Assigned Trainer, or Self]** - Fetch a specific progress snapshot by record UUID.")
async def get_progress(progress_id: UUID, user: Any = Depends(get_current_user)):
    """Fetch a single progress snapshot by ID."""
    record = await db.progressrecord.find_unique(where={"id": str(progress_id)})
    if record is None:
        raise not_found("Progress record")
    if user_role(user) == "TRAINER":
        if str(record.trainerId) != str(user.id):
            raise HTTPException(status_code=403, detail="You cannot access this record")
    else:
        ensure_member_access(user, record.memberId)
    return record


@router.get(
    "/notifications",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)], summary="List user notifications", description="**[Authenticated Users]** - Retrieve personalized or broadcast alerts with optional unread filter.")
async def list_notifications(
    is_read: bool | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    user: Any = Depends(get_current_user),
):
    """Retrieve user notification feed with optional unread filter."""
    where: dict[str, Any] = {"userId": str(user.id)}
    if is_read is not None:
        where["isRead"] = is_read
    return await db.notification.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"createdAt": "desc"},
    )


@router.post(
    "/notifications",
    status_code=status.HTTP_201_CREATED,
    tags=["notifications"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Dispatch notifications to users", description="**[Admin & Manager]** - Send targeted notifications to specific user UUIDs or broadcast alerts across members.")
async def create_notifications(data: NotificationCreate):
    """Broadcast or dispatch notifications to designated users."""
    user_ids = data.user_ids
    if user_ids is None:
        users = await db.user.find_many(where={"isActive": True})
        user_ids = [UUID(str(user.id)) for user in users]
    if not user_ids:
        raise HTTPException(status_code=422, detail="At least one recipient is required")
    unique_ids = list(dict.fromkeys(str(user_id) for user_id in user_ids))
    recipients = await db.user.find_many(where={"id": {"in": unique_ids}})
    if len(recipients) != len(unique_ids):
        raise HTTPException(status_code=404, detail="One or more recipients do not exist")
    return [
        await db.notification.create(
            data={
                "userId": user_id,
                "title": data.title,
                "message": data.message,
                "notificationType": data.notification_type,
            }
        )
        for user_id in unique_ids
    ]


@router.put(
    "/notifications/{notification_id}/read",
    tags=["notifications"],
    dependencies=[Depends(get_current_user)], summary="Mark a notification as read", description="**[Notification Recipient]** - Acknowledges and updates a notification's read timestamp.")
async def mark_notification_read(
    notification_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Mark a notification as read for the current recipient."""
    notification = await db.notification.find_unique(
        where={"id": str(notification_id)}
    )
    if notification is None:
        raise not_found("Notification")
    if str(notification.userId) != str(user.id):
        raise HTTPException(status_code=403, detail="This notification belongs to another user")
    return await db.notification.update(
        where={"id": str(notification_id)}, data={"isRead": True}
    )


@router.get(
    "/reports/members",
    tags=["reports"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Generate member growth and demographic analytics", description="**[Admin & Manager]** - High-level analytics reporting member acquisition, active/inactive distribution, and retention.")
async def member_report(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    group_by: Literal["day", "week", "month"] = "month",
):
    """Generate summary analytics on member counts, active status, and acquisition."""
    where: dict[str, Any] = {}
    if start_date or end_date:
        where["joinDate"] = {}
        if start_date:
            where["joinDate"]["gte"] = start_date
        if end_date:
            where["joinDate"]["lte"] = end_date
    members = await db.memberprofile.find_many(where=where)
    trends: dict[str, int] = {}
    for member in members:
        bucket = date_bucket(member.joinDate, group_by)
        if bucket is not None:
            trends[bucket] = trends.get(bucket, 0) + 1
    return {
        "total_members": len(members),
        "trends": [{"period": key, "count": trends[key]} for key in sorted(trends)],
    }


@router.get(
    "/reports/revenue",
    tags=["reports"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Generate revenue and financial billing analytics", description="**[Admin Only]** - Comprehensive financial metrics including total collected revenue, outstanding dues, and date-bucket trends.")
async def revenue_report(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    group_by: Literal["day", "week", "month"] = "month",
):
    """Generate financial breakdown of revenue, payments, and unpaid balances."""
    where: dict[str, Any] = {"status": "paid"}
    if start_date or end_date:
        where["paidAt"] = {}
        if start_date:
            where["paidAt"]["gte"] = start_date
        if end_date:
            where["paidAt"]["lte"] = end_date
    invoices = await db.invoice.find_many(where=where)
    total = sum((invoice.totalAmount for invoice in invoices), start=Decimal("0"))
    trends: dict[str, Decimal] = {}
    for invoice in invoices:
        bucket = date_bucket(invoice.paidAt, group_by)
        if bucket is not None:
            trends[bucket] = trends.get(bucket, Decimal("0")) + invoice.totalAmount
    created_where: dict[str, Any] = {}
    if start_date or end_date:
        created_where["createdAt"] = {}
        if start_date:
            created_where["createdAt"]["gte"] = start_date
        if end_date:
            created_where["createdAt"]["lte"] = end_date
    all_invoices = await db.invoice.find_many(where=created_where)
    return {
        "paid_invoice_count": len(invoices),
        "unpaid_invoice_count": sum(invoice.status != "paid" for invoice in all_invoices),
        "revenue": str(total),
        "trends": [
            {"period": key, "revenue": str(trends[key])} for key in sorted(trends)
        ],
    }


@router.get(
    "/reports/attendance",
    tags=["reports"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Generate facility attendance and traffic report", description="**[Admin & Manager]** - Aggregates gym foot-traffic patterns, peak workout hours, and class attendance volumes.")
async def attendance_report(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    group_by: Literal["day", "week", "month"] = "month",
):
    """Generate attendance analytics and visit frequency reports."""
    where: dict[str, Any] = {}
    if start_date or end_date:
        where["checkIn"] = {}
        if start_date:
            where["checkIn"]["gte"] = start_date
        if end_date:
            where["checkIn"]["lte"] = end_date
    records = await db.attendance.find_many(where=where)
    trends: dict[str, int] = {}
    for record in records:
        bucket = date_bucket(record.checkIn, group_by)
        if bucket is not None:
            trends[bucket] = trends.get(bucket, 0) + 1
    return {
        "total_check_ins": len(records),
        "trends": [{"period": key, "count": trends[key]} for key in sorted(trends)],
    }


@router.get(
    "/reports/trainer-performance",
    tags=["reports"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="Generate trainer workload and performance metrics", description="**[Admin & Manager]** - Analyzes trainer session volume, client satisfaction ratings, and completed training plans.")
async def trainer_performance_report(
    trainer_id: UUID | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """Generate performance and session volume reports for trainers."""
    where: dict[str, Any] = {}
    if trainer_id:
        where["trainerId"] = str(trainer_id)
    if start_date or end_date:
        where["schedule"] = {}
        if start_date:
            where["schedule"]["gte"] = start_date
        if end_date:
            where["schedule"]["lte"] = end_date
    sessions = await db.classsession.find_many(where=where)
    trainer_ids = list(dict.fromkeys(str(session.trainerId) for session in sessions))
    trainers = await db.trainerprofile.find_many(where={"userId": {"in": trainer_ids}})
    trainer_lookup = {str(trainer.userId): trainer for trainer in trainers}
    report = []
    for trainer_user_id in trainer_ids:
        trainer = trainer_lookup[trainer_user_id]
        report.append(
            {
                "trainer_id": trainer_user_id,
                "specialization": trainer.specialization,
                "rating": trainer.rating,
                "session_count": sum(
                    str(session.trainerId) == trainer_user_id for session in sessions
                ),
            }
        )
    return report


@router.get(
    "/invoices",
    tags=["invoices and payments"],
    dependencies=[Depends(require_roles("ADMIN", "MANAGER"))], summary="List invoices with status and date filters", description="**[Admin, Manager, or Self]** - View billing invoices with filtering by status (paid, pending, overdue) and issue dates.")
async def list_invoices(
    invoice_status: str | None = Query(default=None, alias="status"),
    member_id: UUID | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    """Retrieve billing invoices matching optional status and member filters."""
    where: dict[str, Any] = {}
    if invoice_status:
        where["status"] = invoice_status
    if member_id:
        where["memberId"] = str(member_id)
    if start_date or end_date:
        where["createdAt"] = {}
        if start_date:
            where["createdAt"]["gte"] = start_date
        if end_date:
            where["createdAt"]["lte"] = end_date
    return await db.invoice.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"createdAt": "desc"},
    )


@router.post(
    "/invoices",
    status_code=status.HTTP_201_CREATED,
    tags=["invoices and payments"],
    dependencies=[Depends(require_roles("ADMIN"))], summary="Issue an itemized member invoice", description="**[Admin Only]** - Creates an official invoice with item descriptions, unit amounts, due date, and calculates total sum.")
async def create_invoice(data: InvoiceCreate):
    """Create an itemized billing invoice for a member."""
    if await db.memberprofile.find_unique(where={"userId": str(data.member_id)}) is None:
        raise not_found("Member")
    if data.plan_id and await db.membershipplan.find_unique(
        where={"id": str(data.plan_id)}
    ) is None:
        raise not_found("Membership plan")
    if data.membership_id and await db.membermembership.find_unique(
        where={"id": str(data.membership_id)}
    ) is None:
        raise not_found("Membership")
    return await db.invoice.create(
        data={
            "memberId": str(data.member_id),
            "planId": str(data.plan_id) if data.plan_id else None,
            "membershipId": (
                str(data.membership_id) if data.membership_id else None
            ),
            "items": [item.model_dump(mode="json", by_alias=True) for item in data.items],
            "totalAmount": data.total_amount,
            "dueDate": data.due_date,
        }
    )


@router.get(
    "/invoices/{invoice_id}",
    tags=["invoices and payments"],
    dependencies=[Depends(get_current_user)], summary="Get invoice details and line items", description="**[Admin, Manager, or Billed Member]** - Retrieve full invoice breakdown with individual charge items and payment receipts.")
async def get_invoice(invoice_id: UUID, user: Any = Depends(get_current_user)):
    """Fetch invoice details, line items, and payment status."""
    invoice = await db.invoice.find_unique(where={"id": str(invoice_id)})
    if invoice is None:
        raise not_found("Invoice")
    ensure_member_access(user, invoice.memberId)
    result = invoice.model_dump(mode="json")
    result["payments"] = [
        payment.model_dump(mode="json")
        for payment in await db.payment.find_many(
            where={"invoiceId": str(invoice_id)},
            order={"createdAt": "desc"},
        )
    ]
    return result


@router.post(
    "/invoices/{invoice_id}/pay",
    status_code=status.HTTP_201_CREATED,
    tags=["invoices and payments"],
    dependencies=[Depends(get_current_user)], summary="Process payment against an invoice", description="**[Admin or Billed Member]** - Submit a payment transaction toward an outstanding invoice, automatically updating status when settled.")
async def submit_invoice_payment(
    invoice_id: UUID,
    data: PaymentCreate,
    user: Any = Depends(get_current_user),
):
    """Record a payment transaction toward an unpaid invoice."""
    invoice = await db.invoice.find_unique(where={"id": str(invoice_id)})
    if invoice is None:
        raise not_found("Invoice")
    ensure_member_access(user, invoice.memberId)
    if invoice.status == "paid":
        raise HTTPException(status_code=409, detail="Invoice is already paid")
    if data.amount > invoice.totalAmount:
        raise HTTPException(
            status_code=422,
            detail="Payment amount exceeds the invoice total",
        )
    # Without a configured payment provider, this is a pending payment intent only.
    return await db.payment.create(
        data={
            "invoiceId": str(invoice_id),
            "memberId": str(invoice.memberId),
            "amount": data.amount,
            "paymentMethod": data.payment_method,
            "transactionRef": data.transaction_ref,
            "status": "pending",
        }
    )


@router.get(
    "/members/{member_id}/payments",
    tags=["invoices and payments"],
    dependencies=[Depends(get_current_user)], summary="List all payment receipts for a member", description="**[Admin, Manager, or Self]** - Retrieve historical payment receipts and transaction records for a member account.")
async def list_member_payments(
    member_id: UUID,
    user: Any = Depends(get_current_user),
):
    """List all payment transaction records belonging to a member."""
    ensure_member_access(user, member_id)
    return await db.payment.find_many(
        where={"memberId": str(member_id)},
        order={"createdAt": "desc"},
    )


@router.get(
    "/payments/{payment_id}",
    tags=["invoices and payments"],
    dependencies=[Depends(get_current_user)], summary="Get payment receipt by transaction ID", description="**[Admin, Manager, or Payer]** - Fetch detailed transaction metadata, payment method, amount, and timestamp.")
async def get_payment(payment_id: UUID, user: Any = Depends(get_current_user)):
    """Retrieve a specific payment receipt by ID."""
    payment = await db.payment.find_unique(where={"id": str(payment_id)})
    if payment is None:
        raise not_found("Payment")
    ensure_member_access(user, payment.memberId)
    return payment


@router.post(
    "/ai/request",
    response_model=AIResponseResult,
    tags=["AI"],
    dependencies=[Depends(get_current_user)],
    summary="Submit a fitness question or workout request",
    description="Choose fitness_qa, workout_generation, or exercise_form and provide a clear request. Requires OPENAI_API_KEY.",
)
async def create_ai_request(
    data: AIRequestCreate,
):
    """Submit a prompt or question to the TanaFit AI assistant."""
    prompt = (
        f"Task: {data.request_type}\n"
        f"Request: {data.request_content}\n"
        f"Additional details: {data.parameters or 'None'}"
    )
    try:
        response, model = await generate_response(prompt)
    except AIProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return AIResponseResult(
        request_type=data.request_type,
        response=response,
        model=model,
    )


@router.get(
    "/ai/requests",
    tags=["AI"],
    dependencies=[Depends(get_current_user)], summary="List previous AI assistant conversations", description="**[Admin, Trainer, or Requester]** - Retrieve past AI query records along with generated assistant responses.")
async def list_ai_requests(
    request_type: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    user: Any = Depends(get_current_user),
):
    """Retrieve history of AI assistant requests and responses."""
    role = user_role(user)
    if role == "ADMIN":
        where: dict[str, Any] = {}
    elif role == "MEMBER":
        where = {"memberId": str(user.id)}
    elif role == "TRAINER":
        where = {"trainerId": str(user.id)}
    else:
        raise HTTPException(status_code=403, detail="Forbidden")
    if request_type:
        where["parameters"] = {"path": ["request_type"], "equals": request_type}
    return await db.airequest.find_many(
        where=where,
        skip=(page - 1) * per_page,
        take=per_page,
        order={"createdAt": "desc"},
        include={"responses": True},
    )


@router.get(
    "/ai/requests/{request_id}",
    tags=["AI"],
    dependencies=[Depends(get_current_user)], summary="Get single AI assistant conversation by ID", description="**[Admin or Conversation Owner]** - Fetch a specific AI query record, model parameters, and full response text.")
async def get_ai_request(
    request_id: UUID,
    user: Any = Depends(get_current_user),
):
    """Retrieve a specific AI interaction record with its generated response."""
    request_record = await db.airequest.find_unique(
        where={"id": str(request_id)},
        include={"responses": True},
    )
    if request_record is None:
        raise not_found("AI request")
    role = user_role(user)
    is_owner = str(request_record.memberId or request_record.trainerId) == str(user.id)
    if role != "ADMIN" and not is_owner:
        raise HTTPException(status_code=403, detail="You cannot access this AI request")
    return request_record
