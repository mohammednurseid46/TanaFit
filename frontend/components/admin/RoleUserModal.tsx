"use client";

import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";

import RoleUserForm from "@/components/auth/RoleUserForm";
import type { CreateUserInput } from "@/lib/auth/types";

export default function RoleUserModal({
  role,
}: {
  role: CreateUserInput["role"];
}) {
  const [open, setOpen] = useState(false);
  const label = role === "MANAGER" ? "Manager" : "Trainer";

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        onClick={() => setOpen(true)}
        type="button"
      >
        <UserPlus size={16} />
        Add {label}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            aria-labelledby="role-user-modal-title"
            aria-modal="true"
            className="my-auto w-full max-w-xl rounded-2xl border border-cyan-300/15 bg-[#0f172a] p-5 shadow-2xl shadow-black/40 sm:p-6"
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                  Staff workspace
                </p>
                <h2
                  className="mt-2 text-xl font-semibold text-white"
                  id="role-user-modal-title"
                >
                  Add {label}
                </h2>
              </div>
              <button
                aria-label="Close dialog"
                className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <RoleUserForm role={role} />
          </section>
        </div>
      ) : null}
    </>
  );
}
