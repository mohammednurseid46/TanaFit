"use client";

import { Activity, ArrowUpRight, Scale, TrendingUp } from "lucide-react";

const progress = [
  { label: "Weight loss", value: "-7.4 kg", change: "+12%", accent: "bg-emerald-400" },
  { label: "Muscle gain", value: "+3.1 kg", change: "+8%", accent: "bg-cyan-400" },
  { label: "Strength score", value: "89/100", change: "+15%", accent: "bg-violet-400" },
];

const chartData = [
  { month: "Jan", weight: 74, muscle: 62 },
  { month: "Feb", weight: 73.2, muscle: 63 },
  { month: "Mar", weight: 72.4, muscle: 64 },
  { month: "Apr", weight: 71.7, muscle: 65 },
  { month: "May", weight: 70.6, muscle: 66 },
  { month: "Jun", weight: 69.8, muscle: 68 },
];

export default function TrainerProgressPage() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress tracking</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Alicia Gomez
          </h1>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {progress.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>
                <span className={`size-2.5 rounded-full ${item.accent}`} />
              </div>
              <p className="mt-4 text-3xl font-bold text-white">{item.value}</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-300">
                <ArrowUpRight size={14} />
                {item.change}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Performance curve</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Body composition</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" />Weight</span>
                <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-cyan-400" />Muscle</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <div className="grid grid-cols-6 gap-3">
                {chartData.map((point) => (
                  <div key={point.month} className="flex h-40 flex-col justify-end">
                    <div className="flex h-full items-end gap-1">
                      <div className="w-1/2 rounded-t-lg bg-emerald-400/80" style={{ height: `${(point.weight / 75) * 100}%` }} />
                      <div className="w-1/2 rounded-t-lg bg-cyan-400/80" style={{ height: `${(point.muscle / 75) * 100}%` }} />
                    </div>
                    <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {point.month}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="space-y-6">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Insights</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Key metrics</h2>
                </div>
                <Activity className="text-cyan-300" size={18} />
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Current weight</span>
                    <Scale size={14} className="text-slate-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">68.6 kg</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Training consistency</span>
                    <TrendingUp size={14} className="text-emerald-300" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">92%</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coach notes</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="rounded-xl border border-slate-800 bg-slate-950/25 p-3">
                  Excellent adherence to the strength plan this month.
                </li>
                <li className="rounded-xl border border-slate-800 bg-slate-950/25 p-3">
                  Recovery sessions improved mobility and reduced soreness.
                </li>
                <li className="rounded-xl border border-slate-800 bg-slate-950/25 p-3">
                  Continue progressive overload on lower-body lifts.
                </li>
              </ul>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
