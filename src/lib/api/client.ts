import { siteConfig } from "@/config/site";
import { lookupMockCredential } from "@/lib/auth/mockCredentials";
import { isAdminOnlyPortal } from "@/lib/portal/devScope";
import { apiEndpoints } from "./endpoints";
import { ApiRequestError, classifyHttpFailure } from "./errors";

const accessTokenKey = "creators.access_token";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  retryOnUnauthorized?: boolean;
};

export function joinApiUrl(path: string) {
  const base = siteConfig.apiBaseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const joined = joinApiUrl(path);
  const url = new URL(joined, "http://localhost");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  if (joined.startsWith("/")) return `${url.pathname}${url.search}`;
  return url.toString();
}

export function readAccessToken() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_ACCESS_TOKEN ?? null;
  }
  return window.localStorage.getItem(accessTokenKey);
}

export function writeAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(accessTokenKey, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(accessTokenKey);
}

export async function resolveAccessToken() {
  // Password login/signup write the token. Never invent users via /auth/dev-token.
  return readAccessToken();
}

type AuthResult = {
  accessToken: string;
  role: string;
  email: string;
};

async function readAuthError(response: Response) {
  try {
    const body = (await response.json()) as { detail?: string };
    if (typeof body.detail === "string" && body.detail) return body.detail;
  } catch {
    // ignore
  }
  if (response.status === 401) return "Wrong password";
  if (response.status === 409) return "Email is already registered.";
  return "Could not complete that request.";
}

function mockAccessToken(role: string) {
  return `mock_${role}_${Date.now().toString(36)}`;
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
  role: string;
}): Promise<AuthResult> {
  if (siteConfig.useMockData) {
    const account = lookupMockCredential(input.email, input.role);
    if (!account || account.password !== input.password) {
      throw new Error("Wrong password");
    }
    const email = input.email.trim().toLowerCase();
    const accessToken = mockAccessToken(account.role);
    writeAccessToken(accessToken);
    return { accessToken, role: account.role, email };
  }

  const response = await fetch(joinApiUrl(apiEndpoints.auth.login), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await readAuthError(response));
  const body = (await response.json()) as AuthResult;
  if (!body.accessToken) throw new Error("No access token returned.");
  writeAccessToken(body.accessToken);
  return body;
}

export async function signupWithPassword(input: {
  email: string;
  password: string;
  role: string;
  displayName?: string;
}): Promise<AuthResult> {
  if (siteConfig.useMockData) {
    if (input.role === "admin" && !isAdminOnlyPortal()) {
      throw new Error("Admin accounts are provisioned by the platform team.");
    }
    if (input.password.length < 8) {
      throw new Error("Use a password with at least 8 characters.");
    }
    const email = input.email.trim().toLowerCase();
    if (lookupMockCredential(email, input.role)) {
      throw new Error("Email is already registered.");
    }
    const accessToken = mockAccessToken(input.role);
    writeAccessToken(accessToken);
    return { accessToken, role: input.role, email };
  }

  const response = await fetch(joinApiUrl(apiEndpoints.auth.signup), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      role: input.role,
      displayName: input.displayName,
    }),
  });
  if (!response.ok) throw new Error(await readAuthError(response));
  const body = (await response.json()) as AuthResult;
  if (!body.accessToken) throw new Error("No access token returned.");
  writeAccessToken(body.accessToken);
  return body;
}

export async function apiClient<T>(
  path: string,
  { params, retryOnUnauthorized = true, ...init }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    const token = await resolveAccessToken();
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    res = await fetch(buildUrl(path, params), {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiRequestError(0, path, "api_down");
    }
    throw error;
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") clearAccessToken();
    throw new ApiRequestError(401, path, "unauthenticated");
  }

  if (!res.ok) {
    const kind = classifyHttpFailure(res.status, path);
    throw new ApiRequestError(res.status, path, kind);
  }

  return res.json() as Promise<T>;
}
