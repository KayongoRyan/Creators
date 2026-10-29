# Backend integration (frontend contract)

No backend lives in this repo. The frontend is ready to call your API when `NEXT_PUBLIC_USE_MOCK=0`.

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for REST calls (default `http://localhost:3000/api`) |
| `NEXT_PUBLIC_USE_MOCK` | Unset or anything except `0` → mock/localStorage. `0` → live API |

Implementation: `src/config/site.ts`, `src/lib/api/client.ts`, `src/lib/api/portalApi.ts`, `src/lib/api/endpoints.ts`.

## Auth (demo → real)

Today the client sends optional demo headers on every request (replace with real auth when ready):

- `X-Demo-Role`: `admin` \| `brand` \| `creator`
- `X-Demo-Email`: session email from login demo

Suggested production: `Authorization: Bearer <token>` and role/scoping on the server. Update `src/lib/api/client.ts` when tokens exist.

## Legacy read endpoints (already wired via `fetchResource`)

Used by older feature services; return JSON matching fixture shapes in `src/lib/api/fixtures.ts`.

| Method | Path | Response type |
|---|---|---|
| GET | `/campaigns` | `Campaign[]` |
| GET | `/submissions` | `Submission[]` |
| GET | `/payments` | `Payment[]` |
| GET | `/earnings` | `{ availableCents, pendingCents }` |
| GET | `/brands` | `BrandRecord[]` |
| GET | `/creators` | `CreatorRecord[]` |

When `NEXT_PUBLIC_USE_MOCK=0`, failures propagate (no silent fixture fallback).

## Portal state (primary for admin / brand / creator UIs)

Full shapes: `AdminState`, `BrandState`, `CreatorState` in `src/types/index.ts`. Seeds for reference: `src/lib/api/fixtures.ts` (`adminSeed`), `src/lib/portalSeeds.ts`.

### Admin

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/admin/state` | — | Full `AdminState` |
| POST | `/admin/campaigns` | `CreateCampaignInput` | Create campaign |
| POST | `/admin/creators/:applicationId/verify` | — | Accept application |
| POST | `/admin/creators/:applicationId/reject` | — | Reject application |
| POST | `/admin/submissions/:id/approve` | — | |
| POST | `/admin/submissions/:id/reject` | — | |
| POST | `/admin/submissions/:id/revision` | `{ note: string }` | |
| POST | `/admin/payouts/:id/mark-paid` | — | |
| POST | `/admin/payouts/mark-all-paid` | — | |

Frontend: optimistic local update + POST; on failure shows amber banner (`PortalActionError`).

### Brand

| Method | Path | Response |
|---|---|---|
| GET | `/brand/state` | `BrandState` |

Read-only in the UI today. Brand portal uses Primus demo persona.

### Creator

| Method | Path | Body |
|---|---|---|
| GET | `/creator/state` | — → `CreatorState` |
| POST | `/creator/applications` | `{ campaignId, pitch? }` |
| POST | `/creator/assignments/:id/submit` | `{ postUrl }` |
| PATCH | `/creator/profile` | partial `CreatorProfile` |

## CORS

Browser calls use `fetch` from the Next.js origin. Allow the dev origin and send `Content-Type: application/json`.

## Not implemented on frontend (unfinished)

- Real JWT/session refresh
- Cross-portal sync (admin approve → creator earnings) without shared backend
- Public `/apply` form → API (still standalone)
- Pagination, filters, file uploads for source assets
- Webhooks / MoMo payout provider
- E2E automated tests in CI

See `docs/PHASE4_QA.md` for manual QA checklist.
