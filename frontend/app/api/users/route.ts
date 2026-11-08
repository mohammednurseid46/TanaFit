import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, BACKEND_API_URL } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let userData: unknown;
  try {
    userData = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "User data must contain valid JSON" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}/users/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the user service." },
      { status: 502 },
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
