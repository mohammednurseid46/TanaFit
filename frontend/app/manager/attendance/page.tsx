"use client";

import { Search, ShieldCheck, UserRoundCheck } from "lucide-react";

const checkIns = [
  { name: "Alicia Gomez", plan: "Black Card", time: "08:45 AM", status: "Checked in" },
  { name: "Priya Shah", plan: "Premium", time: "09:10 AM", status: "Checked in" },
  { name: "Daniel Kim", plan: "Gold", time: "09:26 AM", status: "Checked in" },
  { name: "Marcus Hill", plan: "Standard", time: "09:52 AM", status: "Expired" },
  { name: "Nina Patel", plan: "Black Card", time: "10:07 AM", status: "Checked in" },
  { name: "Ethan Brooks", plan: "Premium", time: "10:18 AM", status: "Checked in" },
];

export default function ManagerAttendancePage() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Daily operations
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Attendance
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-2.5 text-sm text-slate-400">
            <Search size={15} className="text-slate-500" />
            <input
              aria-label="Search members"
              placeholder="Search member"
              className="w-48 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Checked in</p>
              <UserRoundCheck size={18} className="text-cyan-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">186</p>
          </article>
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">On-time rate</p>
              <ShieldCheck size={18} className="text-emerald-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">91%</p>
          </article>
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Pending review</p>
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-300">
                3
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">07</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">Today&apos;s check-ins</h2>
              <p className="mt-1 text-xs text-slate-500">Updated in real time</p>
            </div>
            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium text-cyan-300">
              Live feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-950/30 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Check-in time</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {checkIns.map((member) => (
                  <tr key={member.name} className="text-sm text-slate-200">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-[10px] font-bold text-cyan-200">
                          {member.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{member.plan}</td>
                    <td className="px-5 py-4 text-slate-400">{member.time}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          member.status === "Checked in"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-rose-400/10 text-rose-300"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
