"use client";

import { siteConfig } from "@/config/site";
import { readAccessToken } from "@/lib/api/client";
import {
  ApiRequestError,
  toApiRequestError,
  type ApiErrorKind,
} from "@/lib/api/errors";

export type PortalLoadStatus =
  | "loading"
  | "ready"
  | "error"
  | "unauthenticated"
  | "forbidden";

export type HydrateFailure = {
  ok: false;
  kind: ApiErrorKind;
  error: string;
};

export type HydrateSuccess<T> = {
  ok: true;
  data: T;
};

export function formatPortalError(error: unknown) {
  return toApiRequestError(error).message;
}

export function liveSessionMissing() {
  return !siteConfig.useMockData && !readAccessToken();
}

export async function hydrateFromApi<T>(
  fetchRemote: () => Promise<T>,
  writeLocal: (value: T) => void,
): Promise<HydrateSuccess<T> | HydrateFailure> {
  if (siteConfig.useMockData) {
    return { ok: false, kind: "other", error: "hydrateFromApi called in mock mode" };
  }
  if (!readAccessToken()) {
    return { ok: false, kind: "unauthenticated", error: "Sign in required" };
  }
  try {
    const data = await fetchRemote();
    writeLocal(data);
    return { ok: true, data };
  } catch (error) {
    const apiError = toApiRequestError(error);
    return { ok: false, kind: apiError.kind, error: apiError.message };
  }
}

export async function runApiMutation(
  mutation: () => Promise<void>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (siteConfig.useMockData) return { ok: true };
  try {
    await mutation();
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiRequestError && error.kind === "unauthenticated") {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: formatPortalError(error) };
  }
}
