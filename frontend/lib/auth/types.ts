export type UserRole = "ADMIN" | "MANAGER" | "TRAINER" | "MEMBER";

export interface BaseProfile {
  id: string;
  userId: string;
}

export interface AdminProfile extends BaseProfile {
  permissions?: string | null;
  lastLogin?: string | null;
}

export interface ManagerProfile extends BaseProfile {
  branch?: string | null;
  lastLogin?: string | null;
}

export interface TrainerProfile extends BaseProfile {
  specialization?: string | null;
  experienceYears?: number | null;
  certifications?: string | null;
  hourlyRate?: number | string | null;
  rating?: number | string | null;
  totalSessions?: number | null;
  lastLogin?: string | null;
}

export interface MemberProfile extends BaseProfile {
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  joinDate?: string | null;
  membershipStatus?: string | null;
  fitnessGoals?: string | null;
  healthConditions?: string | null;
  memberships?: MemberMembership[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
}

export interface MemberMembership {
  id: string;
  plan: MembershipPlan;
  startDate: string;
  endDate?: string | null;
  status: string;
  autoRenew: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminProfile?: AdminProfile | null;
  managerProfile?: ManagerProfile | null;
  trainerProfile?: TrainerProfile | null;
  memberProfile?: MemberProfile | null;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface CreateUserInput extends RegisterInput {
  role: "MANAGER" | "TRAINER";
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

export function getRoleProfile(user: AuthUser | null) {
  if (!user) return null;

  switch (user.role) {
    case "ADMIN":
      return user.adminProfile ?? null;
    case "MANAGER":
      return user.managerProfile ?? null;
    case "TRAINER":
      return user.trainerProfile ?? null;
    case "MEMBER":
      return user.memberProfile ?? null;
    default:
      return null;
  }
}
