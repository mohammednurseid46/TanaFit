"use client";

import { useState, type FormEvent } from "react";

import { ApiError, authApi } from "@/lib/auth/api";
import type { CreateUserInput } from "@/lib/auth/types";

export default function RoleUserForm({
  role,
}: {
  role: CreateUserInput["role"];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const user = await authApi.createUser({ fullName, email, password, role });
      setMessage(`${role === "MANAGER" ? "Manager" : "Trainer"} account created for ${user.fullName}.`);
      window.dispatchEvent(new Event("gym:users-updated"));
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : `Unable to create the ${role.toLowerCase()} account.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const label = role === "MANAGER" ? "Manager" : "Trainer";

  return (
    <section className="mb-6 rounded-2xl border border-slate-800/80 bg-[#0f172a] p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Add {label}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create a {label.toLowerCase()} account with access appropriate to this role.
        </p>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="space-y-2 text-sm font-medium text-slate-300">
          Full name
          <input
            autoComplete="name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            maxLength={120}
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-300">
          Email
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-300 sm:col-span-2">
          Temporary password
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error || message ? (
          <p
            aria-live="polite"
            className={`rounded-xl px-4 py-3 text-sm sm:col-span-2 ${
              error
                ? "border border-rose-400/20 bg-rose-400/10 text-rose-200"
                : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
            }`}
            role={error ? "alert" : "status"}
          >
            {error || message}
          </p>
        ) : null}
        <button
          className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating account…" : `Add ${label}`}
        </button>
      </form>
    </section>
  );
}
