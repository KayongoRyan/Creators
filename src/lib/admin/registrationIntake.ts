import type { AdminState, AuditEvent, BrandAccount, CreatorApplication } from "@/types";

const MAX_INGESTED = 400;
const NEW_WINDOW_MS = 7 * 86_400_000;

export function isNewWithinWindow(at: string | undefined) {
  if (!at) return false;
  const t = Date.parse(at);
  return Number.isFinite(t) && Date.now() - t < NEW_WINDOW_MS;
}

function activityId() {
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function intakeKey(event: AuditEvent) {
  return event.id;
}

function appendActivity(
  state: AdminState,
  entry: AdminState["activityLog"][number],
): AdminState {
  return {
    ...state,
    activityLog: [entry, ...state.activityLog].slice(0, 80),
  };
}

function addBrandFromRegister(state: AdminState, event: AuditEvent): AdminState {
  const email = normalizeEmail(event.actorEmail);
  if (!email) return state;
  if (state.brandAccounts.some((b) => normalizeEmail(b.contactEmail) === email)) {
    return state;
  }

  const brand: BrandAccount = {
    id: `br_${event.id}`,
    name: event.actorName,
    contactName: event.actorName,
    contactEmail: email,
    status: "pending_payment",
    campaignsRun: 0,
    totalSpentRwf: 0,
    lastActiveAt: event.at,
    joinedAt: event.at,
  };

  let next: AdminState = {
    ...state,
    brandAccounts: [brand, ...state.brandAccounts],
  };
  next = appendActivity(next, {
    id: activityId(),
    at: event.at,
    kind: "brand_registered",
    actorLabel: brand.name,
    summary: `New business account — ${brand.contactEmail}`,
    href: "/admin/brands",
  });
  return next;
}

function parseApplicationMeta(targetLabel: string | undefined) {
  if (!targetLabel) return null;
  const parts = targetLabel.split("|");
  if (parts.length < 3) return null;
  const [tiktok, instagram, niche] = parts;
  return { tiktok, instagram, niche };
}

function addCreatorFromRegister(state: AdminState, event: AuditEvent): AdminState {
  const email = normalizeEmail(event.actorEmail);
  const duplicate = (app: CreatorApplication) =>
    (email && normalizeEmail(app.contactEmail) === email) ||
    app.id === `app_${event.id}`;

  if (state.creatorApplications.some(duplicate)) return state;

  const application: CreatorApplication = {
    id: `app_${event.id}`,
    fullName: event.actorName,
    tiktokHandle: "@pending",
    instagramHandle: "@pending",
    tiktokFollowers: 0,
    instagramFollowers: 0,
    niche: "Awaiting profile (/apply)",
    status: "pending",
    contactEmail: email || undefined,
    appliedAt: event.at,
  };

  let next: AdminState = {
    ...state,
    creatorApplications: [application, ...state.creatorApplications],
  };
  next = appendActivity(next, {
    id: activityId(),
    at: event.at,
    kind: "creator_registered",
    actorLabel: application.fullName,
    summary: email
      ? `New creator account — ${email}`
      : `New creator account — ${application.fullName}`,
    href: "/admin/creators",
  });
  return next;
}

function upsertCreatorApplication(state: AdminState, event: AuditEvent): AdminState {
  const meta = parseApplicationMeta(event.targetLabel);
  const email = normalizeEmail(event.actorEmail);
  const existingIdx = state.creatorApplications.findIndex(
    (app) =>
      app.id === `app_${event.id}` ||
      (email && normalizeEmail(app.contactEmail) === email),
  );

  const base: CreatorApplication = {
    id: existingIdx >= 0 ? state.creatorApplications[existingIdx].id : `app_${event.id}`,
    fullName: event.actorName,
    tiktokHandle: meta?.tiktok || "@pending",
    instagramHandle: meta?.instagram || "@pending",
    tiktokFollowers: 0,
    instagramFollowers: 0,
    niche: meta?.niche || "General",
    status: "pending",
    contactEmail: email || undefined,
    appliedAt: event.at,
  };

  const creatorApplications =
    existingIdx >= 0
      ? state.creatorApplications.map((app, index) =>
          index === existingIdx ? { ...app, ...base } : app,
        )
      : [base, ...state.creatorApplications];

  let next: AdminState = { ...state, creatorApplications };
  if (existingIdx < 0) {
    next = appendActivity(next, {
      id: activityId(),
      at: event.at,
      kind: "creator_application",
      actorLabel: base.fullName,
      summary: `Creator application — ${base.niche}`,
      href: "/admin/creators",
    });
  }
  return next;
}

/** Merge brand/creator signups and applications from the shared audit trail. */
export function syncRegistrationsFromEvents(
  state: AdminState,
  events: AuditEvent[],
): AdminState {
  const ingested = new Set(state.ingestedRegistrationEventIds ?? []);
  let next = state;
  let changed = false;

  for (const event of events) {
    const key = intakeKey(event);
    if (ingested.has(key)) continue;

    if (event.action === "register" && event.actorRole === "brand") {
      ingested.add(key);
      const updated = addBrandFromRegister(next, event);
      if (updated !== next) {
        next = updated;
        changed = true;
      }
      continue;
    }

    if (event.action === "register" && event.actorRole === "creator") {
      ingested.add(key);
      const updated = addCreatorFromRegister(next, event);
      if (updated !== next) {
        next = updated;
        changed = true;
      }
      continue;
    }

    if (event.action === "creator_application" && event.actorRole === "creator") {
      ingested.add(key);
      const updated = upsertCreatorApplication(next, event);
      if (updated !== next) {
        next = updated;
        changed = true;
      }
    }
  }

  if (!changed && ingested.size === (state.ingestedRegistrationEventIds?.length ?? 0)) {
    return state;
  }

  return {
    ...next,
    ingestedRegistrationEventIds: [...ingested].slice(-MAX_INGESTED),
  };
}

export function selectRecentBrandSignups(state: AdminState, withinMs = NEW_WINDOW_MS) {
  const cutoff = Date.now() - withinMs;
  return state.brandAccounts.filter((brand) => {
    const at = brand.joinedAt ?? brand.lastActiveAt;
    const t = Date.parse(at);
    return Number.isFinite(t) && t >= cutoff;
  });
}

export function selectRecentCreatorSignups(state: AdminState, withinMs = NEW_WINDOW_MS) {
  const cutoff = Date.now() - withinMs;
  return state.creatorApplications.filter((app) => {
    if (app.status !== "pending") return false;
    const at = app.appliedAt;
    if (!at) return false;
    const t = Date.parse(at);
    return Number.isFinite(t) && t >= cutoff;
  });
}