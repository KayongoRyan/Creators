import { siteConfig } from "@/config/site";
<<<<<<< Updated upstream
import { lookupMockCredential } from "@/lib/auth/mockCredentials";
=======
>>>>>>> Stashed changes
import { apiEndpoints } from "./endpoints";
import { ApiRequestError, classifyHttpFailure } from "./errors";

const accessTokenKey = "creators.access_token";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  retryOnUnauthorized?: boolean;
  /** Keep the stored token when the API returns 401 (portal hydrate retries). */
  keepTokenOn401?: boolean;
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

async function readResponseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith("<!") || trimmed.startsWith("<html")) {
    throw new Error(
      "API is not reachable (got HTML instead of JSON). Start npm run dev:api and keep Next running.",
    );
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(
      "API returned a non-JSON response. Check NEXT_PUBLIC_API_URL and that FastAPI is up.",
    );
  }
}

async function readAuthError(response: Response) {
  try {
    const body = await readResponseJson<{ detail?: string }>(response);
    if (typeof body.detail === "string" && body.detail) return body.detail;
  } catch (error) {
    if (error instanceof Error && error.message.includes("API")) return error.message;
  }
  if (response.status === 401) return "Wrong password";
  if (response.status === 409) return "Email is already registered.";
  if (response.status === 500 || response.status === 502 || response.status === 503) {
    return "API is not running. Start npm run dev:api, then try again.";
  }
  return "Could not complete that request.";
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
  role: string;
}): Promise<AuthResult> {
  let response: Response;
  try {
    response = await fetch(joinApiUrl(apiEndpoints.auth.login), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      "API is not reachable. Start npm run dev:api (and Next if using /api rewrite).",
    );
  }
  if (!response.ok) throw new Error(await readAuthError(response));
  const body = await readResponseJson<AuthResult>(response);
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
<<<<<<< Updated upstream
  if (input.role === "admin") {
    throw new Error("Admin accounts are provisioned by the platform team.");
  }
  if (siteConfig.useMockData) {
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

=======
>>>>>>> Stashed changes
  let response: Response;
  try {
    response = await fetch(joinApiUrl(apiEndpoints.auth.signup), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        role: input.role,
        displayName: input.displayName,
      }),
    });
  } catch {
    throw new Error(
      "API is not reachable. Start npm run dev:api (and Next if using /api rewrite).",
    );
  }
  if (!response.ok) throw new Error(await readAuthError(response));
  const body = await readResponseJson<AuthResult>(response);
  if (!body.accessToken) throw new Error("No access token returned.");
  writeAccessToken(body.accessToken);
  return body;
}

export type SignupOnboarding = {
  address?: string;
  phone?: string;
  birthDate?: string;
  niches?: string[];
  businessName?: string;
  businessType?: string;
  identificationNumber?: string;
  bankName?: string;
  accountNumber?: string;
};

export type SignupStartResult = {
  needsVerification: boolean;
  email: string;
  role: string;
  bypass?: boolean;
};

async function postAuthJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(joinApiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "API is not reachable. Start npm run dev:api (and Next if using /api rewrite).",
    );
  }
  if (!response.ok) throw new Error(await readAuthError(response));
  return readResponseJson<T>(response);
}

export async function signupStart(input: {
  email: string;
  password: string;
  role: string;
  displayName?: string;
  onboarding?: SignupOnboarding;
}): Promise<SignupStartResult> {
  return postAuthJson<SignupStartResult>(apiEndpoints.auth.signupStart, {
    email: input.email,
    password: input.password,
    role: input.role,
    displayName: input.displayName,
    onboarding: input.onboarding,
  });
}

export async function signupVerify(input: {
  email: string;
  token: string;
  role: string;
}): Promise<AuthResult> {
  const body = await postAuthJson<AuthResult>(apiEndpoints.auth.signupVerify, {
    email: input.email,
    token: input.token,
    role: input.role,
  });
  if (!body.accessToken) throw new Error("No access token returned.");
  writeAccessToken(body.accessToken);
  return body;
}

export async function signupResend(input: {
  email: string;
  role?: string;
}): Promise<{ ok: boolean; email: string; bypass?: boolean }> {
  return postAuthJson(apiEndpoints.auth.signupResend, {
    email: input.email,
    role: input.role,
  });
}

export async function apiClient<T>(
  path: string,
  {
    params,
    retryOnUnauthorized = true,
    keepTokenOn401 = false,
    ...init
  }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    const token = await resolveAccessToken();
    const headers = new Headers(init.headers);
    if (
      !headers.has("Content-Type") &&
      init.body &&
      !(typeof FormData !== "undefined" && init.body instanceof FormData)
    ) {
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
    if (typeof window !== "undefined" && !keepTokenOn401) clearAccessToken();
    throw new ApiRequestError(401, path, "unauthenticated");
  }

  if (!res.ok) {
    const kind = classifyHttpFailure(res.status, path);
    throw new ApiRequestError(res.status, path, kind);
  }

  return readResponseJson<T>(res);
}
