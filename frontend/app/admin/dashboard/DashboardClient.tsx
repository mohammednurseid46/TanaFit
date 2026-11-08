"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Users,
  UserRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import RoleUserModal from "@/components/admin/RoleUserModal";
import { useAuth } from "@/contexts/AuthContext";

const revenue = [
  { month: "Jan", amount: 33200 },
  { month: "Feb", amount: 36800 },
  { month: "Mar", amount: 34900 },
  { month: "Apr", amount: 41700 },
  { month: "May", amount: 44200 },
  { month: "Jun", amount: 40900 },
  { month: "Jul", amount: 47600 },
  { month: "Aug", amount: 45800 },
  { month: "Sep", amount: 51300 },
  { month: "Oct", amount: 58430 },
];

const stats = [
  {
    label: "Total members",
    countKey: "members",
    icon: Users,
    iconStyle: "bg-cyan-400/10 text-cyan-300",
  },
  {
    label: "Active trainers",
    countKey: "activeTrainers",
    icon: UserRound,
    iconStyle: "bg-violet-400/10 text-violet-300",
  },
  {
    label: "Total managers",
    countKey: "managers",
    icon: Users,
    iconStyle: "bg-emerald-400/10 text-emerald-300",
  },
  {
    label: "Total admins",
    countKey: "admins",
    icon: UserRound,
    iconStyle: "bg-amber-400/10 text-amber-300",
  },
] as const;

const activities = [
  {
    initials: "AM",
    name: "Alex Morgan",
    detail: "New member registration",
    time: "8 min ago",
    color: "bg-cyan-400/15 text-cyan-200",
  },
  {
    initials: "JL",
    name: "Jamie Lee",
    detail: "Premium plan renewed",
    time: "24 min ago",
    color: "bg-emerald-400/15 text-emerald-200",
  },
  {
    initials: "ST",
    name: "Sam Taylor",
    detail: "Booked Strength & Conditioning",
    time: "1 hr ago",
    color: "bg-violet-400/15 text-violet-200",
  },
];

interface AdminStats {
  totalUsers: number;
  admins: number;
  managers: number;
  trainers: number;
  activeTrainers: number;
  members: number;
}

function isAdminStats(value: unknown): value is AdminStats {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return [
    "totalUsers",
    "admins",
    "managers",
    "trainers",
    "activeTrainers",
    "members",
  ].every((key) => {
    const count = Reflect.get(value, key);
    return typeof count === "number" && Number.isInteger(count) && count >= 0;
  });
}

function formatCurrency(value: number) {
  return `$${(value / 1000).toFixed(0)}k`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName.trim().split(/\s+/)[0] || "there";
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let active = true;

    async function refreshStats() {
      try {
        const response = await fetch("/api/admin/stats", { cache: "no-store" });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const detail =
            typeof payload === "object" &&
            payload !== null &&
            "detail" in payload &&
            typeof payload.detail === "string"
              ? payload.detail
              : "Unable to load dashboard statistics.";
          throw new Error(detail);
        }
        if (!isAdminStats(payload)) {
          throw new Error("The administration service returned invalid statistics.");
        }
        if (active) {
          setAdminStats(payload);
          setStatsError("");
        }
      } catch (error) {
        if (active) {
          setStatsError(
            error instanceof Error
              ? error.message
              : "Unable to load dashboard statistics.",
          );
        }
      }
    }

    void refreshStats();
    const intervalId = window.setInterval(() => void refreshStats(), 30_000);
    window.addEventListener("focus", refreshStats);
    window.addEventListener("gym:users-updated", refreshStats);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("gym:users-updated", refreshStats);
    };
  }, []);

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">
            Friday, October 16, 2026
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Good morning, {firstName} <span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Here&apos;s what&apos;s happening at your gym today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleUserModal role="MANAGER" />
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0f172a] text-slate-400 transition hover:text-white"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-400" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-2.5 text-xs font-medium text-slate-300"
          >
            <CalendarDays size={15} className="text-slate-400" />
            Year to date
            <ChevronDown size={14} className="text-slate-500" />
          </button>
        </div>
      </header>

      <section
        aria-label="Gym performance summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statsError ? (
          <p
            aria-live="polite"
            className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 sm:col-span-2 xl:col-span-4"
            role="alert"
          >
            {statsError}
          </p>
        ) : null}
        {stats.map(
          ({
            label,
            countKey,
            icon: Icon,
            iconStyle,
          }) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <span className={`flex size-9 items-center justify-center rounded-xl ${iconStyle}`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-4 text-[28px] font-bold tracking-tight text-white">
                {adminStats?.[countKey].toLocaleString() ?? "—"}
              </p>
            </article>
          ),
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Monthly revenue
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Revenue overview for this year
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] text-slate-400">
              2026 <ChevronDown className="ml-1 inline" size={13} />
            </div>
          </div>
          <div className="mb-2 flex items-end gap-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              $58,430
            </span>
            <span className="mb-1 inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400">
              <ArrowUpRight size={14} />
              8.2%
            </span>
          </div>
          <p className="mb-5 text-[11px] text-slate-500">
            Compared to $53,990 last month
          </p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenue}
                margin={{ top: 8, right: 6, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#1e293b"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickMargin={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={formatCurrency}
                  tickMargin={8}
                />
                <Tooltip
                  cursor={{ stroke: "#334155", strokeDasharray: "4 4" }}
                  contentStyle={{
                    backgroundColor: "#111c31",
                    border: "1px solid #263449",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  activeDot={{
                    r: 5,
                    fill: "#22d3ee",
                    stroke: "#0f172a",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Membership overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Active plans by category
              </p>
            </div>
            <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[10px] font-medium text-slate-400">
              This month
            </span>
          </div>
          <div className="relative mx-auto my-7 flex size-44 items-center justify-center rounded-full bg-[conic-gradient(#22d3ee_0deg_180deg,#818cf8_180deg_280deg,#fbbf24_280deg_324deg,#1e293b_324deg_360deg)]">
            <div className="flex size-32 flex-col items-center justify-center rounded-full bg-[#0f172a]">
              <span className="text-3xl font-bold text-white">
                {adminStats?.members.toLocaleString() ?? "—"}
              </span>
              <span className="mt-1 text-[10px] text-slate-500">
                total members
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Monthly", count: "1,420", percentage: "50%", color: "bg-cyan-400" },
              { label: "Annual", count: "790", percentage: "28%", color: "bg-indigo-400" },
              { label: "Student", count: "355", percentage: "13%", color: "bg-amber-400" },
              { label: "Other", count: "275", percentage: "9%", color: "bg-slate-600" },
            ].map((plan) => (
              <div key={plan.label} className="flex items-center gap-2.5 text-xs">
                <span className={`size-2 rounded-full ${plan.color}`} />
                <span className="flex-1 text-slate-400">{plan.label}</span>
                <span className="text-slate-300">{plan.count}</span>
                <span className="w-9 text-right text-slate-500">
                  {plan.percentage}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                The latest updates from your gym
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-800/80">
            {activities.map((activity) => (
              <div
                key={activity.name}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${activity.color}`}
                >
                  {activity.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {activity.name}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {activity.detail}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-950/50 via-[#0f172a] to-[#0f172a] p-5 sm:p-6">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-cyan-400/5 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Today&apos;s classes
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                6 sessions scheduled
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Clock3 size={17} />
            </span>
          </div>
          <div className="relative mt-5 space-y-3">
            {[
              { time: "10:30 AM", title: "Strength & Conditioning", coach: "with Chris", spots: "4 spots left" },
              { time: "12:00 PM", title: "Power Yoga", coach: "with Mia", spots: "Full" },
              { time: "1:30 PM", title: "HIIT Circuit", coach: "with Andre", spots: "7 spots left" },
            ].map((session) => (
              <div
                key={session.title}
                className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-cyan-300">
                    {session.time}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {session.spots}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-200">
                  {session.title}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {session.coach}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
