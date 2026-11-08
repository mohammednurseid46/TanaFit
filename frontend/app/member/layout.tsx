"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, QrCode, Sparkles } from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import UserProfileMenu from "@/components/auth/UserProfileMenu";

const navigation = [
  { href: "/member/dashboard", label: "Home", icon: QrCode },
  { href: "/member/workout", label: "Workout", icon: Dumbbell },
  { href: "/member/classes", label: "Classes", icon: CalendarDays },
  { href: "/member/ai", label: "AI Assistant", icon: Sparkles },
];

export default function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <AuthGuard roles={["MEMBER"]}>
      <div className="min-h-screen bg-[#0b1120] text-slate-200">
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b1120]/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/member/dashboard"
              className="flex items-center gap-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
                <Dumbbell size={18} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-bold tracking-wide text-white">
                Tana<span className="text-cyan-300">Fitness</span>
              </span>
            </Link>
            <nav aria-label="Member navigation" className="flex items-center gap-1">
              {navigation.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-3.5 ${
                      active
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 hover:shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                    }`}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
            <UserProfileMenu />
          </div>
        </header>
        {children}
      </div>
    </AuthGuard>
  );
}
