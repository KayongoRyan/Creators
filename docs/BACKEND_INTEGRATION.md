# Backend integration (frontend contract)

The API is the FastAPI modular monolith in [`apps/api`](../apps/api). The frontend calls it when `NEXT_PUBLIC_USE_MOCK=0`.

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL for REST calls (default `/api` via Next rewrite, or `http://localhost:4000/api`) |
| `NEXT_PUBLIC_USE_MOCK` | Unset or anything except `0` → mock/localStorage. `0` → live API |
| `NEXT_PUBLIC_ACCESS_TOKEN` | Optional static bearer token |

Implementation: `src/config/site.ts`, `src/lib/api/client.ts`, `src/lib/api/portalApi.ts`, `src/lib/api/endpoints.ts`.

## Auth

The browser sends `Authorization: Bearer <access_token>`.

- `POST /auth/signup` `{ email, password, role, displayName }` — creates a Supabase Auth user (`app_metadata.role`) and a `profiles` row with `id = auth.uid()`. Returns `{ accessToken }`.
- `POST /auth/login` `{ email, password, role }` — password grant against Supabase Auth, then requires an existing `profiles` row with that role. **Never creates a profile.** Wrong email/password/role → 401.
- Stored token: `localStorage["creators.access_token"]`. Join/login store it; the client does not invent users from a demo session.
- Demo accounts: `admin@ubunifu.dev`, `brand@ubunifu.dev`, `creator@ubunifu.dev` with password `CreatorsDemo1!`.
- `POST /auth/dev-token` is lookup-only when `AUTH_DEV=1` (tests/scripts). It does not create profiles.
- `AUTH_DEV=1` still accepts `X-Demo-Role` / `X-Demo-Email` for scripts when the profile already exists.

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

## PRD endpoints (admin, not wired in the UI yet)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/admin/campaigns/{id}/fund` | — | Marks the brand invoice paid and opens an `open` campaign |
| POST | `/admin/campaigns/{id}/snapshot` | `{ views: [{ submissionId, views }] }` | Manual view snapshot. Honors `Idempotency-Key` |
| GET | `/admin/campaigns/{id}/report` | — | Brand report JSON |

`POST /admin/campaigns` still accepts `{ title, brandName, campaignType, budgetRwf, deadline }` and optional `platformFeePercent`, `rpmRwf`, `minViews`, `minPayoutRwf`, `maxPayoutRwf`, `setupFeeRwf`, `assignmentMode`, `brief`, `spotsLeft`, `flatPayoutRwf`. Pool = budget − platform fee − setup fee. New campaigns stay draft until funded.

Approve/reject/revision and payout mark-paid accept `Idempotency-Key`.

## Public apply

| Method | Path | Body |
|---|---|---|
| POST | `/public/creator-applications` | multipart: `fullName`, `momo`, `tiktokHandle`, `instagramHandle`, `niche`, `whyJoin`, optional `screenshot` |

Screenshot bytes go to Supabase Storage bucket `creator-screenshots` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, otherwise `apps/api/uploads/`.

## Not implemented on frontend (unfinished)

- Supabase login UI (dev token stands in)
- Pagination, filters, file uploads for clipping source assets
- Automated MoMo disbursement
- E2E automated tests in CI

See `docs/PHASE4_QA.md` for manual QA checklist.
