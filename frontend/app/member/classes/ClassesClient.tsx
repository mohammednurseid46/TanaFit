"use client";

import { useState } from "react";
import { CalendarDays, Check, Clock3, Dumbbell, Flame, Heart, Users, Zap } from "lucide-react";

const availableClasses = [
  { id: "yoga", name: "Sunrise Flow", category: "Yoga", time: "07:00 AM", duration: "50 min", coach: "Mia Chen", spots: 5, icon: Heart, color: "from-violet-500/25 to-indigo-500/5", iconColor: "text-violet-300", tag: "Recovery" },
  { id: "crossfit", name: "CrossFit Engine", category: "CrossFit", time: "09:30 AM", duration: "45 min", coach: "Andre Lewis", spots: 3, icon: Flame, color: "from-orange-500/25 to-rose-500/5", iconColor: "text-orange-300", tag: "High intensity" },
  { id: "strength", name: "Strength Lab", category: "Strength", time: "12:00 PM", duration: "60 min", coach: "Chris Morgan", spots: 8, icon: Dumbbell, color: "from-cyan-500/25 to-blue-500/5", iconColor: "text-cyan-300", tag: "Build strength" },
  { id: "hiit", name: "HIIT Circuit", category: "HIIT", time: "05:30 PM", duration: "40 min", coach: "Taylor James", spots: 2, icon: Zap, color: "from-lime-500/20 to-emerald-500/5", iconColor: "text-lime-300", tag: "Cardio" },
];

export default function MemberClassesPage() {
  const [bookedClasses, setBookedClasses] = useState<string[]>([]);

  function toggleBooking(id: string) {
    setBookedClasses((current) =>
      current.includes(id)
        ? current.filter((classId) => classId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Find your next session
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Group classes
          </h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-2 text-xs text-slate-300">
          <CalendarDays size={14} className="text-cyan-300" />
          Today · Oct 16
        </span>
      </header>

      <section className="mb-5 overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-r from-cyan-950/50 via-[#0f172a] to-[#0f172a] p-5 sm:flex sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Your weekly rhythm</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Keep the momentum going</h2>
          <p className="mt-1 text-sm text-slate-400">You&apos;ve booked 2 of your 4 weekly classes.</p>
        </div>
        <div className="mt-4 flex gap-1.5 sm:mt-0">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <div
              key={`${day}-${index}`}
              className={`flex size-8 items-center justify-center rounded-lg text-[10px] font-semibold ${
                [0, 2, 4].includes(index)
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {availableClasses.map((fitnessClass) => {
          const isBooked = bookedClasses.includes(fitnessClass.id);
          const Icon = fitnessClass.icon;

          return (
            <article
              key={fitnessClass.id}
              className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]"
            >
              <div className={`relative h-28 bg-gradient-to-br ${fitnessClass.color}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_38%)]" />
                <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/30">
                  <Icon size={20} className={fitnessClass.iconColor} />
                </div>
                <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-[10px] font-medium text-slate-200">
                  {fitnessClass.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      {fitnessClass.category}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {fitnessClass.name}
                    </h2>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                    <Users size={12} />
                    {fitnessClass.spots} spots
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} className="text-slate-500" />
                    {fitnessClass.time} · {fitnessClass.duration}
                  </span>
                  <span>Coach {fitnessClass.coach}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleBooking(fitnessClass.id)}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isBooked
                      ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-rose-400/10 hover:text-rose-300'
                      : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                  }`}
                >
                  {isBooked ? (
                    <>
                      <Check size={15} />
                      Booked · Cancel booking
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
