# Telemetry / analytics traffic metrics

## What is real today

Admin `analytics.daily` (from `GET /admin/state`) aggregates **ops metrics from the database**:

- campaigns created
- creator applications
- campaign applications
- submissions / approvals
- collections / payouts (paid totals attributed to the series)

`auditLog` / `activityLog` come from `admin_events`.

## What is stubbed

These fields stay **0 / empty** until a product analytics vendor is chosen:

- `visitors`
- `pageViews`
- `activeUsers`
- `trafficSources`
- `devices`
- `topPages`
- `reviewSla` timings (target hours only)

Dev-only page-view stream: Next `platform-event-hub` → `.data/platform-events.json` (not production telemetry).

## Decision

Keep stubs documented rather than inventing fake traffic. Wire PostHog/GA (or similar) later if product needs session KPIs; do not backfill noise into live API mode.
