"use client";

import { ArrowRight, CalendarDays, Clock3, Dumbbell, Users } from "lucide-react";

const classes = [
  { time: "08:30 AM", title: "HIIT Burn", coach: "Coach Taylor", type: "Group Class", attendees: "18 members" },
  { time: "10:00 AM", title: "Strength Lab", coach: "Coach Chris", type: "Group Class", attendees: "14 members" },
  { time: "12:15 PM", title: "Mobility Flow", coach: "Coach Mia", type: "Recovery", attendees: "9 members" },
  { time: "03:30 PM", title: "One-on-One Coaching", coach: "Coach Alex", type: "Personal Training", attendees: "2 clients" },
];

const personalTraining = [
  { name: "Alicia Gomez", time: "09:00 AM", focus: "Lower body power" },
  { name: "Marcus Hill", time: "11:30 AM", focus: "Strength correction" },
  { name: "Priya Shah", time: "02:00 PM", focus: "Core stability" },
];

export default function TrainerDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trainer portal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Today&apos;s schedule
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-2 text-sm text-slate-300">
            <CalendarDays size={15} className="text-cyan-300" />
            Thursday, Oct 16
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Sessions</p>
              <Dumbbell size={18} className="text-cyan-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">07</p>
          </article>
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Clients</p>
              <Users size={18} className="text-violet-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">14</p>
          </article>
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Next break</p>
              <Clock3 size={18} className="text-emerald-300" />
            </div>
            <p className="mt-4 text-3xl font-bold text-white">12:45</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Upcoming classes</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Group sessions</h2>
              </div>
              <button className="text-xs font-medium text-cyan-300 transition hover:text-cyan-200">
                View calendar
              </button>
            </div>

            <div className="space-y-3">
              {classes.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">{item.time}</p>
                    <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.coach} • {item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Capacity</p>
                    <p className="mt-2 text-sm font-medium text-slate-200">{item.attendees}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Personal training</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Client sessions</h2>
            </div>

            <div className="space-y-3">
              {personalTraining.map((session) => (
                <div key={session.name} className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{session.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{session.focus}</p>
                    </div>
                    <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-300">
                      {session.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
              Review session notes
              <ArrowRight size={15} />
            </button>
          </article>
        </section>
      </div>
    </main>
  );
}
