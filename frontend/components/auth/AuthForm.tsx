"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Dumbbell,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/auth/api";
import { ROLE_HOME } from "@/lib/auth/role-routes";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const { login, signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = isSignup
        ? await signup({ fullName, email, password })
        : await login({ email, password });
      router.replace(ROLE_HOME[user.role]);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.2),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(14,165,233,0.14),transparent_32%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/40 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden border-r border-slate-800 bg-slate-900/80 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border-[40px] border-slate-800/70" />
          <div className="absolute -bottom-28 -left-20 size-72 rounded-full border-[40px] border-cyan-400/5" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10">
                <Dumbbell size={22} strokeWidth={2.5} />
              </span>
              <span className="text-base font-bold text-white">
                Tana<span className="text-cyan-200">Fitness</span>
              </span>
            </Link>
            <div className="mt-24 max-w-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-white/15 text-cyan-200">
                <Sparkles size={24} />
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
                Your strongest chapter starts here.
              </h2>
              <p className="mt-5 leading-7 text-slate-400">
                One smart space for your workouts, classes, progress, and
                personal fitness journey.
              </p>
            </div>
          </div>
          <div className="relative space-y-3 text-sm text-slate-300">
            {["Personalized goals", "Smarter training with Tana AI", "Progress you can see"].map(
              (benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {benefit}
                </div>
              ),
            )}
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-14">
          <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
              <Dumbbell size={20} strokeWidth={2.5} />
            </span>
            <span className="text-base font-bold text-white">
              Tana<span className="text-cyan-400">Fitness</span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {isSignup ? "Begin your journey" : "Welcome back"}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isSignup ? "Create your account" : "Ready to get moving?"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isSignup
                ? "Join TanaFitness and make every session count."
                : "Sign in to continue to your TanaFitness workspace."}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {isSignup ? (
                <label className="block space-y-2 text-sm font-medium text-slate-300">
                  Full name
                  <input
                    autoComplete="name"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    maxLength={120}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    required
                    value={fullName}
                  />
                </label>
              ) : null}
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Email address
                <input
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-300">
                Password
                <span className="relative block">
                  <input
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    minLength={8}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:text-slate-200"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {error ? (
                <p
                  aria-live="polite"
                  className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "Please wait…"
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
                {!submitting && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-emerald-400" />
              Your information is kept secure
            </div>
            <p className="mt-5 text-center text-sm text-slate-400">
              {isSignup ? "Already have an account?" : "New to TanaFitness?"}{" "}
              <Link
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
                href={isSignup ? "/login" : "/signup"}
              >
                {isSignup ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
