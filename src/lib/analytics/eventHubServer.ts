import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditEvent } from "@/types";

const MAX_EVENTS = 600;
const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "platform-events.json");

export async function readHubEvents(): Promise<AuditEvent[]> {
  try {
    const raw = await readFile(dataFile, "utf8");
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

export async function appendHubEvent(event: AuditEvent): Promise<AuditEvent[]> {
  await mkdir(dataDir, { recursive: true });
  const existing = await readHubEvents();
  const seen = new Set(existing.map((e) => e.id));
  if (seen.has(event.id)) return existing;
  const next = [event, ...existing].slice(0, MAX_EVENTS);
  await writeFile(dataFile, JSON.stringify(next), "utf8");
  return next;
}