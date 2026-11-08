export const ACCESS_TOKEN_COOKIE = "gym_access_token";

export const BACKEND_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/+$/, "");
