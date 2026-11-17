import type { AuditEvent } from "@/types";

const STORAGE_KEY = "creators_platform_events_v1";
const HUB_PATH = "/platform-event-hub";
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
    if (process.env.NODE_ENV === "development") {
      void fetch(HUB_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {});
    }
  } catch {
    // Analytics logging must never break a user action.
  }
}

function mergeEventLists(...lists: AuditEvent[][]): AuditEvent[] {
  const seen = new Set<string>();
  const merged: AuditEvent[] = [];
  for (const list of lists) {
    for (const event of list) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(event);
    }
  }
  return merged.sort((a, b) => b.at.localeCompare(a.at)).slice(0, MAX_EVENTS);
}

/** Dev: merge local storage with the shared on-disk hub (all role dev ports). */
export async function fetchPlatformEventsFromHub(): Promise<AuditEvent[]> {
  if (typeof window === "undefined") return [];
  try {
    const res = await fetch(HUB_PATH, { cache: "no-store" });
    if (!res.ok) return readPlatformEvents();
    const hub = (await res.json()) as AuditEvent[];
    return mergeEventLists(readPlatformEvents(), Array.isArray(hub) ? hub : []);
  } catch {
    return readPlatformEvents();
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
