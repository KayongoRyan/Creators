import type { AuditEvent } from "@/types";

const STORAGE_KEY = "creators_platform_events_v1";
const MAX_EVENTS = 600;
const UPDATE_EVENT = "platform-events-updated";

let counter = 0;

function nextEventId() {
  counter += 1;
  return `evt_${Date.now().toString(36)}_${counter.toString(36)}`;
}

/** Live actions recorded across every portal in this browser. */
export function readPlatformEvents(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (event): event is AuditEvent =>
        Boolean(event) &&
        typeof event === "object" &&
        typeof (event as AuditEvent).id === "string" &&
        typeof (event as AuditEvent).at === "string",
    );
  } catch {
    return [];
  }
}

export type RecordPlatformEventInput = Omit<AuditEvent, "id" | "at"> & {
  at?: string;
};

export function currentDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function recordPlatformEvent(input: RecordPlatformEventInput): void {
  if (typeof window === "undefined") return;
  try {
    const event: AuditEvent = {
      ...input,
      source: input.source ?? window.location.pathname,
      device: input.device ?? currentDevice(),
      id: nextEventId(),
      at: input.at ?? new Date().toISOString(),
    };
    const next = [event, ...readPlatformEvents()].slice(0, MAX_EVENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  } catch {
    // Analytics logging must never break a user action.
  }
}

export function clearPlatformEvents(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  } catch {
    // Ignore storage failures.
  }
}

export const PLATFORM_EVENTS_UPDATE = UPDATE_EVENT;
