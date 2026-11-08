"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export default function UserProfileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSignOut() {
    setOpen(false);
    logout();
    router.replace("/login");
  }

  const initials =
    user?.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";
  const roleName = user
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user profile menu"
        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0f172a] p-1.5 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/80"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-cyan-400/15 text-xs font-bold text-cyan-200">
          {initials}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`mr-1 transition-transform ${open ? "rotate-180" : ""}`}
          size={15}
        />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-2xl shadow-black/40"
          role="menu"
        >
          <div className="border-b border-slate-800 px-4 py-4">
            <p className="truncate text-sm font-semibold text-white">
              {user?.fullName ?? "User"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-400">
              {user?.email ?? ""}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
              <UserRound size={12} />
              {roleName}
            </span>
          </div>
          <button
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
            onClick={handleSignOut}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
