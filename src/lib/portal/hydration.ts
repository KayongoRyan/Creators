"use client";

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
  return !readAccessToken();
}

const HYDRATE_RETRY_MS = [0, 350, 800];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function hydrateFromApi<T>(
  fetchRemote: () => Promise<T>,
  writeLocal: (value: T) => void,
): Promise<HydrateSuccess<T> | HydrateFailure> {
  if (!readAccessToken()) {
    return { ok: false, kind: "unauthenticated", error: "Sign in required" };
  }
  let last: ApiRequestError | null = null;
  for (let attempt = 0; attempt < HYDRATE_RETRY_MS.length; attempt++) {
    if (HYDRATE_RETRY_MS[attempt] > 0) {
      await sleep(HYDRATE_RETRY_MS[attempt]);
    }
    try {
      const data = await fetchRemote();
      writeLocal(data);
      return { ok: true, data };
    } catch (error) {
      const apiError = toApiRequestError(error);
      last = apiError;
      if (apiError.kind !== "unauthenticated" || attempt === HYDRATE_RETRY_MS.length - 1) {
        break;
      }
    }
  }
  if (last?.kind === "unauthenticated" && typeof window !== "undefined") {
    const { clearAccessToken } = await import("@/lib/api/client");
    clearAccessToken();
  }
  return {
    ok: false,
    kind: last?.kind ?? "other",
    error: last?.message ?? "Something went wrong loading data.",
  };
}

export async function runApiMutation(
  mutation: () => Promise<void>,
): Promise<{ ok: true } | { ok: false; error: string }> {
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