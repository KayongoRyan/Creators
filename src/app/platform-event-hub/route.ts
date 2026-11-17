import { NextResponse } from "next/server";
import type { AuditEvent } from "@/types";
import { appendHubEvent, readHubEvents } from "@/lib/analytics/eventHubServer";

export const runtime = "nodejs";

function isAuditEvent(value: unknown): value is AuditEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as AuditEvent;
  return (
    typeof event.id === "string" &&
    typeof event.at === "string" &&
    typeof event.actorName === "string" &&
    typeof event.actorRole === "string" &&
    typeof event.action === "string" &&
    typeof event.summary === "string" &&
    typeof event.severity === "string"
  );
}

export async function GET() {
  const events = await readHubEvents();
  return NextResponse.json(events, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isAuditEvent(body)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    await appendHubEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to store event" }, { status: 500 });
  }
}