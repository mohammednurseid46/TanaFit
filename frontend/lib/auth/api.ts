import type {
  AuthUser,
  CreateUserInput,
  LoginInput,
  RegisterInput,
} from "@/lib/auth/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = payload.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === "object" &&
          item !== null &&
          "msg" in item &&
          typeof item.msg === "string"
            ? item.msg
            : "Invalid request",
        )
        .join(". ");
    }
  }
  return "The request could not be completed.";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      headers,
    });
  } catch {
    throw new ApiError("Unable to reach the application server.", 0);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status);
  }
  return payload as T;
}

export const authApi = {
  register(input: RegisterInput): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createUser(input: CreateUserInput): Promise<AuthUser> {
    return request<AuthUser>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(input: LoginInput): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  me(): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/me", {
      method: "GET",
      cache: "no-store",
    });
  },

  logout(): Promise<void> {
    return request<void>("/api/auth/logout", { method: "POST" });
  },
};
