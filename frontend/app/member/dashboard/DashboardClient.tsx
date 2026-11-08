"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const memberProfile = user?.memberProfile ?? null;
  const memberId = user?.id ?? "MEMBER";
  const memberName = user?.fullName ?? "Member";
  const currentMembership = memberProfile?.memberships?.find(
    (membership) => membership.status.toLowerCase() === "active",
  );
  const membershipPlan = currentMembership?.plan.name ?? "No active plan";
  const membershipStatus = memberProfile?.membershipStatus ?? "active";
  const qrValue = `tanafitness://member/${memberId}`;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Hey, {user?.fullName.split(/\s+/)[0] ?? "there"}{" "}
            <span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ready to make today count?
          </p>
        </div>
        <span className="mb-1 hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[11px] font-medium text-emerald-300 sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Member active
        </span>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <article className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-950/50 via-[#0f172a] to-[#0f172a] p-5 sm:p-7">
          <div className="absolute -right-10 -top-12 size-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                  Your gym pass
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Scan to check in
                </h2>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Sparkles size={18} />
              </span>
            </div>

            <div className="mx-auto flex max-w-[290px] flex-col items-center rounded-3xl bg-white p-4 shadow-2xl shadow-slate-950/30">
              <QRCodeSVG
                value={qrValue}
                size={244}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#0b1120"
                title={`Gym entry QR code for ${memberName}`}
                className="h-auto w-full"
              />
              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <ShieldCheck size={12} className="text-emerald-500" />
                Personal entry pass
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>Member ID</span>
              <span className="font-semibold tracking-wider text-slate-200">
                {memberId}
              </span>
              <span className="size-1 rounded-full bg-slate-600" />
              <span>{memberName}</span>
            </div>
          </div>
        </article>

        <div className="flex flex-col gap-5">
          <article className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-300 via-blue-500 to-violet-500" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Membership status
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Membership{" "}
                  <span className="text-cyan-300">
                    {membershipStatus.toLowerCase() === "active"
                      ? "active"
                      : membershipStatus}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {membershipPlan} · {membershipStatus}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Check size={18} />
              </span>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Plan duration</span>
                <span className="font-medium text-slate-300">
                  {currentMembership?.plan.durationDays ?? 0} days
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
              </div>
            </div>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Renew membership
              <ArrowRight size={14} />
            </button>
          </article>

          <article className="flex-1 rounded-3xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Up next
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Strength & Conditioning
                </h2>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                <Dumbbell size={18} />
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/35 p-3.5">
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
                <span className="text-[9px] font-semibold uppercase">Today</span>
                <span className="text-sm font-bold">5:30</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200">Studio 2</p>
                <p className="mt-1 text-xs text-slate-500">with Coach Chris · 45 min</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Clock3 size={12} />
                PM
              </span>
            </div>
            <Link
              href="/member/classes"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition hover:text-white"
            >
              Browse all classes <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <article className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-[#0f172a] p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
            <Flame size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-white">8,420</p>
            <p className="text-[11px] text-slate-500">Steps today</p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-[#0f172a] p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <Dumbbell size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-white">3 / 4</p>
            <p className="text-[11px] text-slate-500">Weekly workouts</p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-[#0f172a] p-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
            <CalendarDays size={18} />
          </span>
          <div>
            <p className="text-xl font-bold text-white">2</p>
            <p className="text-[11px] text-slate-500">Classes booked</p>
          </div>
        </article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-r from-violet-950/35 via-[#0f172a] to-cyan-950/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <TrendingUp size={18} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
                Workout report
              </p>
              <h2 className="mt-1 text-base font-semibold text-white">
                You&apos;re building a strong weekly rhythm
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                3 of 4 workouts complete this week. Ask Tana AI for a deeper progress summary.
              </p>
            </div>
          </div>
          <Link
            href="/member/ai"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-400 px-3.5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-violet-300 hover:shadow-[0_0_20px_rgba(167,139,250,0.25)]"
          >
            View Full AI Assistant
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
