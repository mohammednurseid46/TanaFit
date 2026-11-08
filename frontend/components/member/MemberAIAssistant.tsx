"use client";

import { FormEvent, useState } from "react";
import {
  ArrowUp,
  BrainCircuit,
  Dumbbell,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type AssistantAction =
  | "workout-plan"
  | "exercise-explanation"
  | "progress-summary"
  | "fitness-qa";

type AssistantHandler = (prompt?: string) => void;

export type MemberAIAssistantProps = Partial<
  Record<AssistantAction, AssistantHandler>
>;

const actions: Array<{
  id: AssistantAction;
  label: string;
  description: string;
  icon: typeof Dumbbell;
  iconClassName: string;
  prompt: string;
}> = [
  {
    id: "workout-plan",
    label: "Personalized workout plan",
    description: "Build a routine around your goals",
    icon: Dumbbell,
    iconClassName: "bg-cyan-400/10 text-cyan-300",
    prompt: "Create a personalized workout plan for me.",
  },
  {
    id: "exercise-explanation",
    label: "Explain an exercise",
    description: "Get clear form and technique tips",
    icon: Lightbulb,
    iconClassName: "bg-amber-400/10 text-amber-300",
    prompt: "Explain how to perform an exercise.",
  },
  {
    id: "progress-summary",
    label: "Summarize my progress",
    description: "See what is improving over time",
    icon: TrendingUp,
    iconClassName: "bg-emerald-400/10 text-emerald-300",
    prompt: "Summarize my fitness progress.",
  },
  {
    id: "fitness-qa",
    label: "Ask a fitness question",
    description: "Get an answer tailored to you",
    icon: MessageCircleQuestion,
    iconClassName: "bg-violet-400/10 text-violet-300",
    prompt: "",
  },
];

export default function MemberAIAssistant({
  "workout-plan": onGenerateWorkoutPlan,
  "exercise-explanation": onExplainExercise,
  "progress-summary": onSummarizeProgress,
  "fitness-qa": onFitnessQuestion,
}: MemberAIAssistantProps) {
  const [selectedAction, setSelectedAction] =
    useState<AssistantAction>("fitness-qa");
  const [prompt, setPrompt] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  const handlers: Record<AssistantAction, AssistantHandler> = {
    "workout-plan":
      onGenerateWorkoutPlan ?? (() => console.info("Generate workout plan")),
    "exercise-explanation":
      onExplainExercise ?? (() => console.info("Explain exercise")),
    "progress-summary":
      onSummarizeProgress ?? (() => console.info("Summarize progress")),
    "fitness-qa":
      onFitnessQuestion ?? ((question) => console.info("Answer fitness Q&A", question)),
  };

  function selectAction(action: AssistantAction) {
    setSelectedAction(action);
    const selected = actions.find((item) => item.id === action);
    if (selected?.prompt) {
      setPrompt(selected.prompt);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    setSubmittedPrompt(value);
    handlers[selectedAction](value);
    setPrompt("");
  }

  return (
    <section
      aria-labelledby="ai-assistant-title"
      className="group/assistant relative overflow-hidden rounded-3xl border border-violet-300/20 bg-[radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.2),transparent_35%),radial-gradient(circle_at_10%_100%,rgba(34,211,238,0.1),transparent_30%),linear-gradient(135deg,#211044_0%,#111827_48%,#0f172a_100%)] p-5 shadow-2xl shadow-violet-950/20 transition-all duration-500 hover:border-violet-300/35 hover:shadow-violet-950/35 sm:p-7"
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/15 blur-3xl transition-opacity duration-500 group-hover/assistant:opacity-80" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-cyan-400/10 blur-3xl transition-transform duration-700 group-hover/assistant:scale-125" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-400 text-slate-950 shadow-lg shadow-violet-950/40 transition-transform duration-500 group-hover/assistant:rotate-6 group-hover/assistant:scale-105">
              <BrainCircuit size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/75">
                  Tana AI
                </p>
                <span className="flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>
              <h2 id="ai-assistant-title" className="mt-1 text-xl font-bold text-white">
                Your personal fitness assistant
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-400">
                Get practical guidance for your next workout, powered by your goals and progress.
              </p>
            </div>
          </div>
          <Sparkles className="hidden text-cyan-300/70 drop-shadow-[0_0_10px_rgba(103,232,249,0.7)] sm:block" size={20} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {actions.map(({ id, label, description, icon: Icon, iconClassName }) => {
            const active = selectedAction === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectAction(id)}
                aria-pressed={active}
                className={`group/card relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg ${
                  active
                    ? "border-violet-300/60 bg-violet-400/15 shadow-[0_0_24px_rgba(167,139,250,0.12)]"
                    : "border-slate-700/80 bg-slate-950/25 hover:border-cyan-300/40 hover:bg-slate-900/70 hover:shadow-cyan-950/30"
                }`}
              >
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform duration-300 group-hover/card:scale-110 ${iconClassName}`}>
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-100 transition-colors group-hover/card:text-white">
                    {label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">
                    {description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="fitness-question" className="sr-only">
            Ask your fitness assistant
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/50 p-2 pl-4 transition focus-within:border-violet-300/40">
            <MessageCircleQuestion size={18} className="shrink-0 text-slate-500" />
            <input
              id="fitness-question"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                selectedAction === "fitness-qa"
                  ? "Ask anything about fitness..."
                  : "Add details to personalize your request..."
              }
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              aria-label="Send request to fitness assistant"
              disabled={!prompt.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-400 text-slate-950 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={17} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {submittedPrompt ? (
          <p className="mt-3 text-xs text-slate-500">
            Request queued: <span className="text-slate-300">{submittedPrompt}</span>
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-slate-600">
            AI guidance is for informational purposes and does not replace professional medical advice.
          </p>
        )}
      </div>
    </section>
  );
}
