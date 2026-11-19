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

**Local mode (default dev):** leave `SUPABASE_URL` empty in `apps/api/.env`. Passwords are bcrypt hashes on `profiles.password_hash`. API returns an HS256 JWT from `JWT_SECRET`.

**Supabase mode:** set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and service role. Creator/brand signup uses **email OTP** (see [`AUTH_EMAIL_OTP.md`](./AUTH_EMAIL_OTP.md)). Portal sessions still use HS256 API tokens after verify/login.

- `POST /auth/signup/start` `{ email, password, role, displayName, onboarding? }` — creator/brand only. Creates unconfirmed Auth user + `pending_signups`. Returns `{ needsVerification: true }` (no `profiles` yet).
- `POST /auth/signup/verify` `{ email, token, role }` — verifies 6-digit OTP, creates `profiles` + creator/brand links + onboarding fields. Returns `{ accessToken }`.
- `POST /auth/signup/resend` `{ email, role? }` — resends signup OTP.
- `POST /auth/signup` `{ email, password, role, displayName }` — admin (or local bcrypt without Supabase). Creator/brand with Supabase → 422 directing clients to start/verify.
- `POST /auth/login` `{ email, password, role }` — verifies password (local bcrypt or Supabase). Requires matching role. Unconfirmed Supabase users → verify-email message. Never creates a profile on failed login.
- Password policy (signup): ≥8 chars, upper, lower, digit, no spaces (mirrored in `src/lib/validators/auth.ts`).
- Stored token: `localStorage["creators.access_token"]`.
- `POST /auth/dev-token` is lookup-only when `AUTH_DEV=1` (tests/scripts). It does not create profiles.
- `AUTH_DEV=1` still accepts `X-Demo-Role` / `X-Demo-Email` for scripts when the profile already exists.
- `AUTH_EMAIL_OTP_BYPASS=1` (with `AUTH_DEV=1` only) accepts OTP `000000` without SMTP.

**Smoke:** `npm run dev:api`, then `GET http://127.0.0.1:4000/api/health` → `{"ok":true}`. Front: `NEXT_PUBLIC_USE_MOCK=0`, `NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api`.

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

| Method | Path | Body / Response |
|---|---|---|
| GET | `/brand/state` | `BrandState` (includes `campaignId` on invoices) |
| POST | `/brand/campaigns` | `{ title, campaignType, budgetRwf, deadline, brief? }` → `{ id }` |

Admin `GET /admin/state` also returns `activityLog`, `auditLog`, `brandAccounts`, and derived `analytics` from DB (`admin_events` + aggregates).

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

## Clipping source assets

`POST /admin/campaigns/{id}/source-asset` (multipart `file`) stores the asset and sets `campaigns.source_asset_path` (also surfaces on assignments missing `sourceUrl`).

## Phone fields

Prefer `phone` on creator profile / public apply. Legacy `momo` / `momo_phone` still accepted and mirrored.

## Analytics traffic stubs

`analytics.daily` ops counters (campaigns, applications, submissions, payouts) are DB-derived. `visitors` / `pageViews` / `activeUsers` stay `0` until a real telemetry product is wired. See [`docs/TELEMETRY.md`](TELEMETRY.md).

See `docs/PHASE4_QA.md` for manual QA checklist and `docs/DEPLOY.md` for production.
