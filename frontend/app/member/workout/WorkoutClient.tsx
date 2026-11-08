"use client";

import { useState } from "react";
import { Check, Clock3, Dumbbell, Flame, MoreHorizontal } from "lucide-react";

const initialExercises = [
  { id: "squat", name: "Barbell Back Squat", detail: "4 sets · 8 reps", weight: "45 kg", focus: "Lower body" },
  { id: "rdl", name: "Romanian Deadlift", detail: "3 sets · 10 reps", weight: "35 kg", focus: "Hamstrings" },
  { id: "lunge", name: "Walking Lunges", detail: "3 sets · 12 each", weight: "12 kg", focus: "Unilateral" },
  { id: "bridge", name: "Hip Thrust", detail: "4 sets · 10 reps", weight: "50 kg", focus: "Glutes" },
];

export default function MemberWorkoutPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const totalVolume = completed.length;

  function toggleExercise(id: string) {
    setCompleted((current) =>
      current.includes(id)
        ? current.filter((exerciseId) => exerciseId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-9">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
          Friday · Day 4
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Lower body strength
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Your plan from Coach Chris. Focus on control and good form.
        </p>
      </header>

      <section className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-3.5 sm:p-4">
          <Clock3 size={16} className="text-cyan-300" />
          <p className="mt-2 text-lg font-bold text-white">50 min</p>
          <p className="text-[10px] text-slate-500">Est. duration</p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-3.5 sm:p-4">
          <Dumbbell size={16} className="text-violet-300" />
          <p className="mt-2 text-lg font-bold text-white">{initialExercises.length}</p>
          <p className="text-[10px] text-slate-500">Exercises</p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a] p-3.5 sm:p-4">
          <Flame size={16} className="text-orange-300" />
          <p className="mt-2 text-lg font-bold text-white">{completed.length} / 4</p>
          <p className="text-[10px] text-slate-500">Completed</p>
        </div>
      </section>

      <section className="mb-5 rounded-2xl border border-slate-800/80 bg-[#0f172a] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">Workout progress</span>
          <span className="text-cyan-300">{Math.round((completed.length / initialExercises.length) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
            style={{ width: `${(completed.length / initialExercises.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="space-y-3">
        {initialExercises.map((exercise, index) => {
          const isCompleted = completed.includes(exercise.id);
          return (
            <article
              key={exercise.id}
              className={`rounded-2xl border bg-[#0f172a] p-4 transition ${
                isCompleted ? "border-emerald-400/30 opacity-75" : "border-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`${isCompleted ? "Mark" : "Complete"} ${exercise.name} ${
                    isCompleted ? "incomplete" : "as completed"
                  }`}
                  aria-pressed={isCompleted}
                  onClick={() => toggleExercise(exercise.id)}
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg border transition ${
                    isCompleted
                      ? "border-emerald-400 bg-emerald-400 text-slate-950"
                      : "border-slate-600 bg-slate-950/50 text-transparent hover:border-cyan-300"
                  }`}
                >
                  <Check size={15} />
                </button>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Dumbbell size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-sm font-semibold ${isCompleted ? "text-slate-400 line-through" : "text-white"}`}>
                      {exercise.name}
                    </h2>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400">
                      {exercise.focus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{exercise.detail}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-200">{exercise.weight}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Target</p>
                </div>
                <button
                  type="button"
                  aria-label={`More options for ${exercise.name}`}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                >
                  <MoreHorizontal size={17} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-3 sm:hidden">
                <span className="text-[10px] text-slate-500">Exercise {index + 1}</span>
                <span className="text-xs font-semibold text-slate-300">{exercise.weight} target</span>
              </div>
            </article>
          );
        })}
      </section>

      <button
        type="button"
        disabled={completed.length !== initialExercises.length}
        className="mt-5 w-full rounded-2xl bg-lime-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
      >
        {completed.length === initialExercises.length
          ? "Workout complete — great work!"
          : `Complete workout · ${totalVolume} of ${initialExercises.length}`}
      </button>
    </main>
  );
}
