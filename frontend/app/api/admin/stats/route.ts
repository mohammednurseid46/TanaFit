import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, BACKEND_API_URL } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the administration service." },
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
