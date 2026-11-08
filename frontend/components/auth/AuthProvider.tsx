"use client";

import type { ReactNode } from "react";

import { AuthProvider as Provider } from "@/contexts/AuthContext";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
