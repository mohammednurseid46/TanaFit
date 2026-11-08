"use client";

import { useEffect, type ComponentType } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/auth/types";

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  allowedRoles?: UserRole[],
) {
  function ProtectedComponent(props: P) {
    const { user, status } = useAuth();
    const router = useRouter();
    const allowed = Boolean(
      user && (!allowedRoles || allowedRoles.includes(user.role)),
    );

    useEffect(() => {
      if (status === "unauthenticated") {
        router.replace("/login");
      } else if (status === "authenticated" && user && !allowed) {
        router.replace("/unauthorized");
      }
    }, [allowed, router, status, user]);

    if (status !== "authenticated" || !allowed) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b1120] text-sm text-slate-400">
          Checking your session…
        </div>
      );
    }

    return <Component {...props} />;
  }

  ProtectedComponent.displayName = `withAuth(${
    Component.displayName || Component.name || "Component"
  })`;
  return ProtectedComponent;
}
