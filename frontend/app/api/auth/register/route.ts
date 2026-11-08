import { NextRequest, NextResponse } from "next/server";

import { BACKEND_API_URL } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  let registration: unknown;
  try {
    registration = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Registration body must contain valid JSON" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registration),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
