"use client";

import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Dumbbell,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  durationDays: number;
  benefits?: string | null;
}

const features = [
  {
    icon: BrainCircuit,
    title: "AI Fitness Assistant",
    description:
      "Get adaptive workout guidance, exercise tips, and answers built around your goals.",
    accent: "text-violet-300",
    background: "bg-violet-400/10",
  },
  {
    icon: CalendarDays,
    title: "Class Booking",
    description:
      "Find your next favorite class and reserve your spot in seconds from any device.",
    accent: "text-cyan-300",
    background: "bg-cyan-400/10",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress Tracking",
    description:
      "See your momentum clearly with simple insights that keep every milestone in view.",
    accent: "text-emerald-300",
    background: "bg-emerald-400/10",
  },
  {
    icon: QrCode,
    title: "Quick Check-In",
    description:
      "Scan your personal QR code and get on the floor without waiting at the desk.",
    accent: "text-amber-300",
    background: "bg-amber-400/10",
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  const response = await fetch(`${apiUrl}/plans?is_active=true`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("We couldn't load membership plans right now.");
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("The membership plans response was invalid.");
  }

  return payload.map((plan) => {
    if (
      typeof plan !== "object" ||
      plan === null ||
      typeof plan.name !== "string" ||
      (typeof plan.price !== "string" && typeof plan.price !== "number") ||
      typeof plan.durationDays !== "number"
    ) {
      throw new Error("The membership plans response was invalid.");
    }

    return {
      id: String(plan.id),
      name: plan.name,
      description:
        typeof plan.description === "string" ? plan.description : null,
      price: plan.price,
      durationDays: plan.durationDays,
      benefits: typeof plan.benefits === "string" ? plan.benefits : null,
    };
  });
}

function getBenefits(benefits: string | null | undefined): string[] {
  return (benefits ?? "")
    .split(/[,;\n]/)
    .map((benefit) => benefit.trim())
    .filter(Boolean);
}

export default function Home() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const fetchedPlans = await fetchMembershipPlans();
        if (active) setPlans(fetchedPlans);
      } catch (error) {
        if (active) {
          setPlansError(
            error instanceof Error
              ? error.message
              : "We couldn't load membership plans right now.",
          );
        }
      } finally {
        if (active) setPlansLoading(false);
      }
    }

    void loadPlans();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.12),transparent_32%)]" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25">
              <Dumbbell size={21} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Tana<span className="text-cyan-400">Fitness</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Sign up
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-sm font-medium text-cyan-400">
              <Sparkles size={16} className="text-cyan-400" />
              Meet your smarter fitness companion
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Train with purpose.
              <span className="block bg-gradient-to-r from-cyan-400 to-teal-200 bg-clip-text text-transparent">
                Live stronger.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              TanaFitness brings your workouts, classes, progress, and
              community together. Let Tana AI help you make every session
              count.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 font-semibold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:bg-cyan-300"
              >
                Start your journey
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3.5 font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                Explore the platform
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={18} className="text-cyan-400" />
              Built for your goals, your pace, and your progress
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-[3rem] bg-cyan-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Good morning, athlete</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Your week at a glance
                  </h2>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
                  <Zap size={21} fill="currentColor" />
                </div>
              </div>
              <div className="mt-7 rounded-2xl border border-slate-700 bg-slate-900 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-cyan-400">Tana AI says</p>
                    <p className="mt-2 max-w-[220px] text-xl font-semibold leading-snug text-white">
                      “Small steps. Strong habits. Let’s get moving.”
                    </p>
                  </div>
                  <BrainCircuit size={28} className="text-cyan-400" />
                </div>
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-4/5 rounded-full bg-cyan-400" />
                </div>
                <p className="mt-2 text-xs text-cyan-400">4 of 5 goals this week</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">Active streak</p>
                  <p className="mt-2 text-2xl font-bold text-white">12 <span className="text-sm font-medium text-slate-400">days</span></p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">Next class</p>
                  <p className="mt-2 text-base font-bold text-white">HIIT <span className="text-sm font-medium text-slate-400">6:30 PM</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Everything in one place</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your fitness, made simpler.</h2>
            <p className="mt-4 text-slate-400">The tools you need to show up consistently and make progress you can feel.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-3xl border border-white/8 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-white/15">
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${feature.background} ${feature.accent}`}>
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Membership plans</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Choose your pace.</h2>
          <p className="mt-4 text-slate-400">Flexible plans to help you build a routine that lasts.</p>
        </div>

        {plansLoading ? (
          <div className="mt-12 flex min-h-56 items-center justify-center rounded-3xl border border-white/8 bg-slate-900/50">
            <div className="flex items-center gap-3 text-slate-400">
              <LoaderCircle size={20} className="animate-spin text-violet-400" />
              Loading membership plans...
            </div>
          </div>
        ) : plansError ? (
          <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-3 rounded-3xl border border-rose-400/20 bg-rose-400/5 p-6 text-center text-sm text-rose-200">
            <AlertCircle size={20} className="shrink-0 text-rose-300" />
            {plansError}
          </div>
        ) : plans.length === 0 ? (
          <p className="mt-12 text-center text-slate-400">Membership plans are coming soon.</p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const benefits = getBenefits(plan.benefits);
              return (
                <div key={plan.id} className={`relative flex flex-col rounded-3xl border p-7 ${index === 1 ? "border-violet-400/50 bg-violet-500/[0.08] shadow-2xl shadow-violet-950/30" : "border-white/8 bg-slate-900/70"}`}>
                  {index === 1 && <span className="absolute -top-3 left-7 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  {plan.description && <p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">{plan.description}</p>}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${Number(plan.price).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
                    <span className="text-sm text-slate-500">/ {plan.durationDays} days</span>
                  </div>
                  <div className="my-7 h-px bg-white/8" />
                  <ul className="flex-1 space-y-3">
                    {benefits.length > 0 ? benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 text-sm text-slate-300">
                        <Check size={17} className="mt-0.5 shrink-0 text-emerald-400" />
                        {benefit}
                      </li>
                    )) : <li className="text-sm text-slate-500">Flexible access to TanaFitness</li>}
                  </ul>
                  <Link href="/register" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-100">
                    Choose plan <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-slate-500">
        <p>TanaFitness. Stronger starts here.</p>
      </footer>
    </main>
  );
}
