"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Dumbbell } from "lucide-react";

type ExerciseEntry = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

const initialExercises: ExerciseEntry[] = [
  { name: "Barbell Squat", sets: "4", reps: "8", weight: "110 lb" },
  { name: "Bench Press", sets: "4", reps: "6", weight: "95 lb" },
];

export default function WorkoutBuilder() {
  const [memberName, setMemberName] = useState("Alicia Gomez");
  const [exercises, setExercises] = useState<ExerciseEntry[]>(initialExercises);

  function updateExercise(index: number, field: keyof ExerciseEntry, value: string) {
    setExercises((current) =>
      current.map((exercise, currentIndex) =>
        currentIndex === index ? { ...exercise, [field]: value } : exercise,
      ),
    );
  }

  function addExercise() {
    setExercises((current) => [
      ...current,
      { name: "New Exercise", sets: "3", reps: "10", weight: "50 lb" },
    ]);
  }

  function removeExercise(index: number) {
    setExercises((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0f172a] p-5 shadow-lg shadow-slate-950/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Workout builder</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Assign training plan</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
          <Dumbbell size={12} />
          Custom program
        </span>
      </div>

      <label className="mb-5 block text-sm text-slate-300">
        Client
        <input
          value={memberName}
          onChange={(event) => setMemberName(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 text-slate-200 outline-none focus:border-cyan-400/50"
        />
      </label>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={`${exercise.name}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Exercise {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-300 transition hover:text-rose-200"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="block text-xs text-slate-400">
                Exercise
                <input
                  value={exercise.name}
                  onChange={(event) => updateExercise(index, "name", event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="block text-xs text-slate-400">
                Sets
                <input
                  value={exercise.sets}
                  onChange={(event) => updateExercise(index, "sets", event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="block text-xs text-slate-400">
                Reps
                <input
                  value={exercise.reps}
                  onChange={(event) => updateExercise(index, "reps", event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="block text-xs text-slate-400">
                Weight
                <input
                  value={exercise.weight}
                  onChange={(event) => updateExercise(index, "weight", event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addExercise}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/40 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          <Plus size={16} />
          Add exercise
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          <Save size={16} />
          Save Plan
        </button>
      </div>
    </div>
  );
}
