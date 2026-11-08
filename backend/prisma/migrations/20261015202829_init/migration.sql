-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'TRAINER', 'MEMBER');

-- CreateTable
CREATE TABLE "USERS" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ADMINS" (
    "user_id" UUID NOT NULL,
    "permissions" TEXT,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "ADMINS_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "MANAGERS" (
    "user_id" UUID NOT NULL,
    "branch" TEXT,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "MANAGERS_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "TRAINERS" (
    "user_id" UUID NOT NULL,
    "specialization" TEXT,
    "experience_years" INTEGER,
    "certifications" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "rating" DECIMAL(3,2),
    "total_sessions" INTEGER,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "TRAINERS_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "MEMBERS" (
    "user_id" UUID NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membership_status" TEXT NOT NULL DEFAULT 'active',
    "fitness_goals" TEXT,
    "health_conditions" TEXT,

    CONSTRAINT "MEMBERS_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "MEMBERSHIP_PLANS" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "benefits" TEXT,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MEMBERSHIP_PLANS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MEMBER_MEMBERSHIPS" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MEMBER_MEMBERSHIPS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CLASS_SESSIONS" (
    "id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CLASS_SESSIONS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CLASS_BOOKINGS" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "booking_status" TEXT NOT NULL DEFAULT 'pending',
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "CLASS_BOOKINGS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ATTENDANCE" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'present',
    "duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ATTENDANCE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WORKOUT_PLANS" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "trainer_id" UUID,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goal" TEXT,
    "difficulty_level" TEXT,
    "workout_weeks" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WORKOUT_PLANS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EXERCISES" (
    "id" UUID NOT NULL,
    "workout_plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "sets" INTEGER,
    "reps" INTEGER,
    "rest_time" TEXT,
    "description" TEXT,
    "video_url" TEXT,
    "difficulty_level" TEXT,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EXERCISES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EXERCISE_EXPLANATIONS" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "description" TEXT,
    "form_tips" TEXT,
    "common_mistakes" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EXERCISE_EXPLANATIONS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "INVOICES" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "membership_id" UUID,
    "plan_id" UUID,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "INVOICES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PAYMENTS" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_ref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "payment_notes" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PAYMENTS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EQUIPMENT" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition_status" TEXT NOT NULL DEFAULT 'good',
    "purchase_date" TIMESTAMP(3),
    "warranty_end_date" TIMESTAMP(3),
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EQUIPMENT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EQUIPMENT_MAINTENANCE" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "cost" DECIMAL(10,2),
    "next_due_date" TIMESTAMP(3),

    CONSTRAINT "EQUIPMENT_MAINTENANCE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PROGRESS_RECORDS" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "trainer_id" UUID,
    "record_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DECIMAL(10,2),
    "body_fat" DECIMAL(10,2),
    "performance_score" INTEGER,
    "summary" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PROGRESS_RECORDS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NOTIFICATIONS" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NOTIFICATIONS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AI_CHATBOT" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "model_version" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AI_CHATBOT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AI_REQUESTS" (
    "id" UUID NOT NULL,
    "member_id" UUID,
    "trainer_id" UUID,
    "chatbot_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "parameters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AI_REQUESTS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AI_RESPONSES" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "response_content" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode_used" TEXT,

    CONSTRAINT "AI_RESPONSES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FITNESS_QA" (
    "id" UUID NOT NULL,
    "member_id" UUID,
    "trainer_id" UUID,
    "question_text" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FITNESS_QA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USERS_email_key" ON "USERS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PAYMENTS_transaction_ref_key" ON "PAYMENTS"("transaction_ref");

-- AddForeignKey
ALTER TABLE "ADMINS" ADD CONSTRAINT "ADMINS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MANAGERS" ADD CONSTRAINT "MANAGERS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TRAINERS" ADD CONSTRAINT "TRAINERS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MEMBERS" ADD CONSTRAINT "MEMBERS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MEMBER_MEMBERSHIPS" ADD CONSTRAINT "MEMBER_MEMBERSHIPS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MEMBER_MEMBERSHIPS" ADD CONSTRAINT "MEMBER_MEMBERSHIPS_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "MEMBERSHIP_PLANS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLASS_SESSIONS" ADD CONSTRAINT "CLASS_SESSIONS_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "TRAINERS"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLASS_BOOKINGS" ADD CONSTRAINT "CLASS_BOOKINGS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLASS_BOOKINGS" ADD CONSTRAINT "CLASS_BOOKINGS_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "CLASS_SESSIONS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ATTENDANCE" ADD CONSTRAINT "ATTENDANCE_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ATTENDANCE" ADD CONSTRAINT "ATTENDANCE_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "CLASS_SESSIONS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WORKOUT_PLANS" ADD CONSTRAINT "WORKOUT_PLANS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WORKOUT_PLANS" ADD CONSTRAINT "WORKOUT_PLANS_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "TRAINERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EXERCISES" ADD CONSTRAINT "EXERCISES_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "WORKOUT_PLANS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EXERCISE_EXPLANATIONS" ADD CONSTRAINT "EXERCISE_EXPLANATIONS_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "EXERCISES"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INVOICES" ADD CONSTRAINT "INVOICES_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INVOICES" ADD CONSTRAINT "INVOICES_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "MEMBER_MEMBERSHIPS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAYMENTS" ADD CONSTRAINT "PAYMENTS_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "INVOICES"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAYMENTS" ADD CONSTRAINT "PAYMENTS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EQUIPMENT_MAINTENANCE" ADD CONSTRAINT "EQUIPMENT_MAINTENANCE_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "EQUIPMENT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PROGRESS_RECORDS" ADD CONSTRAINT "PROGRESS_RECORDS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PROGRESS_RECORDS" ADD CONSTRAINT "PROGRESS_RECORDS_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "TRAINERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTIFICATIONS" ADD CONSTRAINT "NOTIFICATIONS_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_REQUESTS" ADD CONSTRAINT "AI_REQUESTS_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_REQUESTS" ADD CONSTRAINT "AI_REQUESTS_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "TRAINERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_REQUESTS" ADD CONSTRAINT "AI_REQUESTS_chatbot_id_fkey" FOREIGN KEY ("chatbot_id") REFERENCES "AI_CHATBOT"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AI_RESPONSES" ADD CONSTRAINT "AI_RESPONSES_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "AI_REQUESTS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FITNESS_QA" ADD CONSTRAINT "FITNESS_QA_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "MEMBERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FITNESS_QA" ADD CONSTRAINT "FITNESS_QA_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "TRAINERS"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
