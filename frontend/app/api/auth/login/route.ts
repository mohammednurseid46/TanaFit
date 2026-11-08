import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, BACKEND_API_URL } from "@/lib/auth/server";

const SESSION_MAX_AGE = 30 * 60;

async function readPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function POST(request: NextRequest) {
  let credentials: unknown;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Login body must contain valid JSON" },
      { status: 400 },
    );
  }

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }

  const tokenPayload: unknown = await readPayload(tokenResponse);
  if (!tokenResponse.ok) {
    return NextResponse.json(tokenPayload, { status: tokenResponse.status });
  }
  if (
    typeof tokenPayload !== "object" ||
    tokenPayload === null ||
    !("access_token" in tokenPayload) ||
    typeof tokenPayload.access_token !== "string"
  ) {
    return NextResponse.json(
      { detail: "The authentication service returned an invalid token response." },
      { status: 502 },
    );
  }

  let profileResponse: Response;
  try {
    profileResponse = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { detail: "Unable to load the authenticated profile." },
      { status: 502 },
    );
  }

  const profile = await readPayload(profileResponse);
  if (!profileResponse.ok) {
    return NextResponse.json(profile, { status: profileResponse.status });
  }

  const response = NextResponse.json(profile);
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokenPayload.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
