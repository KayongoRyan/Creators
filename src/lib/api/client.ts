import { siteConfig } from "@/config/site";
import { apiEndpoints } from "./endpoints";

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

export async function loginWithPassword(input: {
  email: string;
  password: string;
  role: string;
}): Promise<AuthResult> {
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
  const token = await resolveAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(buildUrl(path, params), {
    ...init,
    headers,
  });

  if (res.status === 401 && retryOnUnauthorized && typeof window !== "undefined") {
    clearAccessToken();
    return apiClient<T>(path, { params, ...init, retryOnUnauthorized: false });
  }

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
