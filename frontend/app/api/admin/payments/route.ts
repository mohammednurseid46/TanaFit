import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, BACKEND_API_URL } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  return proxyAdminPayments(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyAdminPayments(request, "POST");
}

async function proxyAdminPayments(
  request: NextRequest,
  method: "GET" | "POST",
) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  let body: string | undefined;
  if (method === "POST") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return NextResponse.json(
        { detail: "Payment data must contain valid JSON" },
        { status: 400 },
      );
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}/admin/payments`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
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
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
