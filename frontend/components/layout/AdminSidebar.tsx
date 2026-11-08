"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  UserRoundCog,
  Users,
} from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Trainers", href: "/admin/trainers", icon: Activity },
  { label: "Managers", href: "/admin/managers", icon: UserRoundCog },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Classes", href: "/admin/classes", icon: BarChart3 },
  { label: "Equipment", href: "/admin/equipment", icon: Dumbbell },
];

function Brand() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
        <Dumbbell size={21} strokeWidth={2.5} />
      </span>
      <span>
        <span className="block text-sm font-bold tracking-wide text-white">
          Tana<span className="text-cyan-400">Fitness</span>
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Admin workspace
        </span>
      </span>
    </Link>
  );
}

function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className={
        mobile
          ? "flex gap-1 overflow-x-auto pb-1"
          : "flex flex-col gap-1"
      }
    >
      {links.map(({ label, href, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/15"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            }`}
          >
            <Icon
              size={18}
              className={
                active
                  ? "text-cyan-300"
                  : "text-slate-500 group-hover:text-slate-300"
              }
            />
            {label}
            {label === "Equipment" && !mobile ? (
              <span className="ml-auto size-1.5 rounded-full bg-amber-400" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-[#0b1120] px-5 py-7 lg:flex">
        <Brand />
        <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Workspace
        </p>
        <Navigation />
        <div className="mt-auto rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">
              Today&apos;s capacity
            </span>
            <span className="text-xs font-semibold text-cyan-300">72%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[72%] rounded-full bg-cyan-400" />
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500">
            184 of 255 spots in use
          </p>
        </div>
      </aside>
      <div className="border-b border-slate-800/80 bg-[#0b1120] px-4 py-4 lg:hidden">
        <div className="mb-4 flex items-center justify-between">
          <Brand />
        </div>
        <Navigation mobile />
      </div>
    </>
  );
}
