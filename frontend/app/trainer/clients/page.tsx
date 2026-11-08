"use client";

import { Search, Target } from "lucide-react";
import WorkoutBuilder from "@/components/trainer/WorkoutBuilder";

const clients = [
  {
    name: "Alicia Gomez",
    goal: "Build lower body strength",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    status: "On track",
  },
  {
    name: "Marcus Hill",
    goal: "Improve posture and mobility",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    status: "Needs focus",
  },
  {
    name: "Priya Shah",
    goal: "Lean muscle gain",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    status: "On track",
  },
  {
    name: "Daniel Kim",
    goal: "Increase endurance for runs",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    status: "Improving",
  },
  {
    name: "Nina Patel",
    goal: "Reduce body fat and improve stamina",
    photo:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80",
    status: "On track",
  },
  {
    name: "Ethan Brooks",
    goal: "Gain upper body mass",
    photo:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    status: "Needs focus",
  },
];

export default function TrainerClientsPage() {
  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Client roster</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Assigned members</h1>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] px-3 py-2.5 text-sm text-slate-400">
            <Search size={15} className="text-slate-500" />
            <input
              aria-label="Search clients"
              placeholder="Search clients"
              className="w-48 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <article key={client.name} className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={client.photo}
                    alt={client.name}
                    className="size-12 rounded-full object-cover ring-2 ring-cyan-400/40"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{client.name}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                        client.status === "On track"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : client.status === "Improving"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    <Target size={12} className="text-cyan-300" />
                    Goal
                  </div>
                  <p className="text-sm text-slate-200">{client.goal}</p>
                </div>
              </article>
            ))}
          </section>

          <WorkoutBuilder />
        </div>
      </div>
    </main>
  );
}
