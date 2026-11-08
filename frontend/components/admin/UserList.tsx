"use client";

import { useEffect, useState } from "react";

interface ListedUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
}

function isListedUserList(value: unknown): value is ListedUser[] {
  return (
    Array.isArray(value) &&
    value.every(
      (user) =>
        typeof user === "object" &&
        user !== null &&
        "id" in user &&
        typeof user.id === "string" &&
        "fullName" in user &&
        typeof user.fullName === "string" &&
        "email" in user &&
        typeof user.email === "string" &&
        "isActive" in user &&
        typeof user.isActive === "boolean",
    )
  );
}

export default function UserList({
  role,
}: {
  role: "MEMBER" | "TRAINER" | "MANAGER";
}) {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/admin/users?role=${encodeURIComponent(role)}`,
          { cache: "no-store" },
        );
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const detail =
            typeof payload === "object" &&
            payload !== null &&
            "detail" in payload &&
            typeof payload.detail === "string"
              ? payload.detail
              : "Unable to load users.";
          throw new Error(detail);
        }
        if (!isListedUserList(payload)) {
          throw new Error("The user service returned an invalid user list.");
        }
        if (active) {
          setUsers(payload);
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : "Unable to load users.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();
    const refreshInterval = window.setInterval(() => void loadUsers(), 30_000);
    window.addEventListener("focus", loadUsers);
    window.addEventListener("gym:users-updated", loadUsers);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", loadUsers);
      window.removeEventListener("gym:users-updated", loadUsers);
    };
  }, [role]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a]">
      {loading ? (
        <p className="p-6 text-sm text-slate-400" role="status">
          Loading {role.toLowerCase()}s…
        </p>
      ) : error ? (
        <p
          aria-live="polite"
          className="p-6 text-sm text-rose-200"
          role="alert"
        >
          {error}
        </p>
      ) : users.length === 0 ? (
        <p className="p-6 text-sm text-slate-400">
          No {role.toLowerCase()} accounts found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Full name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Account status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((user) => (
                <tr className="text-slate-300" key={user.id}>
                  <td className="px-5 py-4 font-medium text-white">
                    {user.fullName}
                  </td>
                  <td className="px-5 py-4">{user.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-slate-700/60 text-slate-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
