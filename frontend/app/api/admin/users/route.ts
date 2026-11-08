import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, BACKEND_API_URL } from "@/lib/auth/server";

const USER_ROLES = new Set(["MEMBER", "TRAINER", "MANAGER"]);

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const role = request.nextUrl.searchParams.get("role");
  if (!role || !USER_ROLES.has(role)) {
    return NextResponse.json(
      { detail: "A supported user role is required." },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      `${BACKEND_API_URL}/users/?role=${encodeURIComponent(role)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the user service." },
      { status: 502 },
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorResponse = NextResponse.json(payload, {
      status: response.status,
    });
    if (response.status === 401) {
      errorResponse.cookies.delete(ACCESS_TOKEN_COOKIE);
    }
    return errorResponse;
  }

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
