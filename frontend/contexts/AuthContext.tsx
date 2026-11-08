"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/auth/api";
import type {
  AuthStatus,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/lib/auth/types";

function normalizeAuthUser(
  user: Partial<AuthUser> | null | undefined,
): AuthUser | null {
  if (!user) return null;

  return {
    id: typeof user.id === "string" ? user.id : String(user.id ?? ""),
    fullName: typeof user.fullName === "string" ? user.fullName : "",
    email: typeof user.email === "string" ? user.email : "",
    phone: typeof user.phone === "string" ? user.phone : null,
    role: user.role ?? "MEMBER",
    isActive: Boolean(user.isActive),
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof user.updatedAt === "string"
        ? user.updatedAt
        : new Date().toISOString(),
    adminProfile:
      user.adminProfile && typeof user.adminProfile === "object"
        ? {
            ...user.adminProfile,
            id: String(user.adminProfile.id ?? ""),
            userId: String(user.adminProfile.userId ?? user.id ?? ""),
          }
        : null,
    managerProfile:
      user.managerProfile && typeof user.managerProfile === "object"
        ? {
            ...user.managerProfile,
            id: String(user.managerProfile.id ?? ""),
            userId: String(user.managerProfile.userId ?? user.id ?? ""),
          }
        : null,
    trainerProfile:
      user.trainerProfile && typeof user.trainerProfile === "object"
        ? {
            ...user.trainerProfile,
            id: String(user.trainerProfile.id ?? ""),
            userId: String(user.trainerProfile.userId ?? user.id ?? ""),
          }
        : null,
    memberProfile:
      user.memberProfile && typeof user.memberProfile === "object"
        ? {
            ...user.memberProfile,
            id: String(user.memberProfile.id ?? ""),
            userId: String(user.memberProfile.userId ?? user.id ?? ""),
            memberships: user.memberProfile.memberships?.map((membership) => ({
              ...membership,
              id: String(membership.id),
              plan: {
                ...membership.plan,
                id: String(membership.plan.id),
                price: Number(membership.plan.price),
              },
            })),
          }
        : null,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login(input: LoginInput): Promise<AuthUser>;
  signup(input: RegisterInput): Promise<AuthUser>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      window.localStorage.removeItem("gym_access_token");
      window.localStorage.removeItem("gym_refresh_token");
      try {
        const currentUser = normalizeAuthUser(await authApi.me());
        if (active) {
          setUser(currentUser);
          setStatus(currentUser ? "authenticated" : "unauthenticated");
        }
      } catch {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const currentUser = normalizeAuthUser(await authApi.login(input));
    if (!currentUser) {
      throw new Error("Unable to sign in.");
    }
    setUser(currentUser);
    setStatus("authenticated");
    return currentUser;
  }, []);

  const signup = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input);
      return login({ email: input.email, password: input.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    void authApi.logout().catch((error: unknown) => {
      console.error("Unable to clear the server-side session cookie.", error);
    });
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, signup, logout }),
    [user, status, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
