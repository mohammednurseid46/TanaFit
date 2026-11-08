# TanaFit

## System Features

TanaFit is a full-stack gym management system with a FastAPI backend and a
Next.js frontend. The system currently includes the following features.

### Frontend Features

- Public landing page, member registration, login, and unauthorized-access
  screens.
- Role-based dashboards for administrators, managers, trainers, and members.
- Admin management for users, members, trainers, managers, classes, equipment,
  and payments.
- Manager views for attendance monitoring and payment operations.
- Trainer views for assigned clients and member progress tracking.
- Member views for class reservations, workout plans, and the TanaFit AI
  assistant.
- Session-aware navigation and protected role-specific route groups.
- Responsive dashboard interfaces with charts, tables, forms, and status
  indicators.

### Backend Features

- JWT authentication with bcrypt password hashing and role-based access
  control.
- User, member, trainer, and manager profile management.
- Membership plans, subscriptions, classes, bookings, check-ins, and
  check-outs.
- Equipment inventory and maintenance history.
- Workout plans, exercise lists, and member progress records.
- Invoice creation, payment processing, payment audit logs, and reconciliation.
- Administrative statistics and reports for members, revenue, attendance, and
  trainers.
- AI fitness questions, workout generation, exercise-form guidance, and saved
  AI request history.
- Prisma database migrations, OpenAPI documentation, health checks, and
  automated API tests.

## Features That Must Be Included

The following capabilities are required for a complete production-ready gym
management system:

- **Secure access:** registration, login, logout, JWT expiration, password
  reset, strong password rules, and server-side role permissions.
- **Complete member lifecycle:** member onboarding, membership plans,
  subscription status, renewals, freezes, cancellations, and expiry
  notifications.
- **Class and attendance management:** capacity limits, waitlists, booking
  cancellation, trainer assignment, QR or staff check-in, and attendance
  history.
- **Billing and payments:** invoices, multiple payment methods, receipts,
  failed-payment handling, refunds, recurring billing, and payment-provider
  integration.
- **Workout and coaching tools:** trainer-created plans, exercise library,
  progress measurements, goals, notes, and member-trainer communication.
- **Operations management:** equipment status, maintenance schedules,
  maintenance reminders, staff management, and audit logs.
- **Reports and analytics:** revenue, membership growth, retention, attendance,
  class utilization, trainer performance, and exportable reports.
- **Notifications:** email or in-app notifications for bookings, payments,
  renewals, class changes, maintenance, and security events.
- **Data protection:** input validation, rate limiting, secure secrets,
  database backups, encryption in transit, privacy controls, and activity
  logging.
- **Reliability and usability:** responsive mobile support, accessible forms,
  clear error messages, loading and empty states, monitoring, health checks,
  and automated unit, integration, and end-to-end tests.