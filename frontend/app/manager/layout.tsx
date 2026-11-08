import Link from "next/link";

import AuthGuard from "@/components/auth/AuthGuard";
import UserProfileMenu from "@/components/auth/UserProfileMenu";

const links = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/attendance", label: "Attendance" },
  { href: "/manager/payments", label: "Payments" },
];

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard roles={["ADMIN", "MANAGER"]}>
      <div className="min-h-screen bg-[#0b1120] text-slate-200">
        <header className="border-b border-slate-800/80 bg-[#0b1120]/95">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <nav aria-label="Manager navigation" className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-2">
              {links.map((link) => (
                <Link
                  className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <UserProfileMenu />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-9">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
