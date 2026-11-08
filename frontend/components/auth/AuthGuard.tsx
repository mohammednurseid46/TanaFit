"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/components/auth/withAuth";
import type { UserRole } from "@/lib/auth/types";

interface RoleContentProps {
  children: ReactNode;
  roles: UserRole[];
}

function RoleContent({ children, roles }: RoleContentProps) {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = Boolean(user && roles.includes(user.role));

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/unauthorized");
    }
  }, [allowed, router, user]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1120] text-sm text-slate-400">
        Checking your permissions…
      </div>
    );
  }

  return children;
}

const AuthenticatedRoleContent = withAuth(RoleContent);

export default function AuthGuard({
  children,
  roles,
}: RoleContentProps) {
  return (
    <AuthenticatedRoleContent roles={roles}>
      {children}
    </AuthenticatedRoleContent>
  );
}
