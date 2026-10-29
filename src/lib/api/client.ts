import { siteConfig } from "@/config/site";
import { readDemoSession } from "@/features/auth/demoSession";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

function demoAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const session = readDemoSession();
  if (!session) return {};
  return {
    "X-Demo-Role": session.role,
    "X-Demo-Email": session.email,
  };
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path, siteConfig.apiBaseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiClient<T>(
  path: string,
  { params, ...init }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...demoAuthHeaders(),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
