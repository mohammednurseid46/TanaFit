import type { UserRole } from "@/lib/auth/types";

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  TRAINER: "/trainer/dashboard",
  MEMBER: "/member/dashboard",
};
