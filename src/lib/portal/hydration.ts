"use client";

import { siteConfig } from "@/config/site";

export type PortalLoadStatus = "loading" | "ready" | "error";

export function formatPortalError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong loading data.";
}

export async function hydrateFromApi<T>(
  fetchRemote: () => Promise<T>,
  writeLocal: (value: T) => void,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  if (siteConfig.useMockData) {
    return { ok: false, error: "hydrateFromApi called in mock mode" };
  }
  try {
    const data = await fetchRemote();
    writeLocal(data);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: formatPortalError(error) };
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
    return { ok: false, error: formatPortalError(error) };
  }
}
