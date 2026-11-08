"use client";

import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  QrCode,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { QRScannerModal } from "@/components/manager/QRScannerModal";
import RoleUserModal from "@/components/admin/RoleUserModal";

const stats = [
  { label: "Checked in today", value: "184", change: "+18%", icon: Users },
  { label: "Pending payments", value: "11", change: "4 urgent", icon: CreditCard },
  { label: "Avg. visit time", value: "42m", change: "+7m", icon: Clock3 },
];

const todayMembers = [
  { name: "Alicia Gomez", status: "Active", time: "08:45 AM" },
  { name: "Marcus Hill", status: "Expired", time: "08:52 AM" },
  { name: "Priya Shah", status: "Active", time: "09:10 AM" },
  { name: "Daniel Kim", status: "Active", time: "09:26 AM" },
  { name: "Nina Patel", status: "Active", time: "09:48 AM" },
];

export default function ManagerDashboardPage() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <QRScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Operations desk
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Manager dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <RoleUserModal role="TRAINER" />
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
            >
              <QrCode size={18} />
              Scan Member QR
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {stats.map(({ label, value, change, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Icon size={18} />
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
                <span className="text-xs font-medium text-emerald-300">{change}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Live traffic
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  Check-in flow
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            <div className="space-y-4">
              {todayMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/35 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xs font-semibold text-cyan-200">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{member.name}</p>
                      <p className="text-[11px] text-slate-500">#{String(index + 1204).padStart(4, "0")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                        member.status === "Active"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {member.status}
                    </span>
                    <span className="text-[11px] text-slate-500">{member.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Quick action
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Membership renewal
                  </h2>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Sparkles size={18} />
                </span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-sm text-slate-300">Marcus Hill</p>
                <p className="mt-1 text-[11px] text-rose-300">Expired since Aug 18</p>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Process renewal
                <ArrowRight size={16} />
              </button>
            </article>

            <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Performance
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Today</h2>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <TrendingUp size={18} />
                </span>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Member check-ins</span>
                    <span>74%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full w-[74%] rounded-full bg-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Renewal conversion</span>
                    <span>62%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full w-[62%] rounded-full bg-violet-400" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Member satisfaction</span>
                    <span>91%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full w-[91%] rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
