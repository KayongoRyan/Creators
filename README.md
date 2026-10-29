# Creators

Workspace for brands and creators. Brands post campaigns. Creators apply. Submissions and payouts run on the same brief.

Frontend-only demo today: interactive **admin**, **brand**, and **creator** portals with mock data in the browser. A real API can be plugged in without changing page routes (see [Backend integration](#backend-integration)).

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Commands

```bash
npm install
npm run dev          # http://localhost:3000  (.next)
npm run dev:admin    # http://localhost:3001/admin  (.next-admin)
npm run dev:brand    # http://localhost:3002/brand  (.next-brand)
npm run dev:creator  # http://localhost:3003/creator (.next-creator)
```

Role dev scripts use **separate ports and `.next-*` folders** so you can run admin + brand + creator at once without corrupting the cache.

If you see `Cannot find module './611.js'`, missing `vendor-chunks`, or `reading '/_app'` errors — corrupted `.next` from old parallel dev or running `build` while dev is up:

```bash
npm run dev:reset
```

Then start the dev servers you need again. Do not delete `.next` manually while any `next dev` is still running.

Legacy one-liner (port 3000 only):

```bash
npm run dev:clean
```

```bash
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

### Git

Default branch is `main`. Work on **`Ryan`**:

```bash
git checkout Ryan
git add .
git commit -m "your message"
git push origin Ryan
```

Repo: [github.com/KayongoRyan/Creators](https://github.com/KayongoRyan/Creators)

## Demo data

| Mode | Behavior |
|---|---|
| **Mock (default)** | Portals read/write `localStorage`. Full create / apply / submit / approve flows work offline. |
| **Live API** | Set `NEXT_PUBLIC_USE_MOCK=0`. Portals `GET` portal state from your API; writes are optimistic locally + `POST`/`PATCH` (see docs). |

**localStorage keys** (clear to reset a portal):

| Key | Portal |
|---|---|
| `creators.demo-session` | Login role (admin / brand / creator) |
| `creators_admin_state_v1` | Admin |
| `creators_brand_state_v1` | Brand |
| `creators_creator_state_v1` | Creator |

Login at `/login` or use `dev:admin` / `dev:brand` / `dev:creator` to seed the demo session.

## Env

Copy [`.env.example`](.env.example) to `.env.local` when overriding defaults.

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | REST base URL |
| `NEXT_PUBLIC_USE_MOCK` | on (anything except `0`) | `0` = call real API |
| `NEXT_PUBLIC_DEMO_ROLE` | — | Set by `dev:*` scripts; optional |

## Backend integration

There is **no backend in this repo**. The frontend expects REST endpoints documented here:

- [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) — routes, request/response shapes (`AdminState`, `BrandState`, `CreatorState`), demo headers
- [`docs/PHASE4_QA.md`](docs/PHASE4_QA.md) — manual QA checklist, responsive breakpoints, known gaps

Code entry points: `src/lib/api/endpoints.ts`, `src/lib/api/portalApi.ts`, `src/lib/api/client.ts`, `src/config/site.ts`.

## What each portal does

**Admin** — Overview KPIs, campaign create, creator applications (verify/reject), submission review (approve/reject/revision), payout tracking.

**Brand** — Dashboard, campaign list and detail (post links + performance), invoices, contact.

**Creator** — Dashboard, discover campaigns (brief, RPM/flat fee, deadline), apply, assigned tasks and URL submit, submissions list, earnings/history, profile.

Shared UX: confirm dialogs, empty states, form validation; loading/error/retry when API mode is on (`*PortalGate` in layouts).

## Architecture

Pages stay thin. Domain UI and state live in `features/`. Shared chrome in `components/`.

```
src/
├── app/                 # routes only
│   ├── (public)/        # /, /apply
│   ├── (auth)/          # /login, /register
│   ├── admin/
│   ├── brand/
│   └── creator/
├── components/
│   ├── ui/
│   ├── layout/          # DashboardShell, portal gates
│   ├── marketing/
│   ├── workspace/       # brand/creator card primitives
│   └── shared/
├── features/
│   ├── admin/           # store + admin screens
│   ├── brand/
│   ├── creator/
│   ├── auth/
│   └── …                # legacy read services (campaigns, submissions, …)
├── lib/
│   ├── api/
│   ├── portal/
│   ├── portalSeeds.ts   # brand/creator demo seed
│   └── format/, validators/
├── types/
└── config/              # routes, navigation, site
```

**Conventions**

1. New page → `app/.../page.tsx` (thin; often a one-line import from `features/`).
2. Portal state → `features/{admin,brand,creator}/store.ts` + `*StoreProvider` in layout.
3. Links and nav → `config/routes.ts`, `config/navigation.ts`.

## Routes

| Area | Paths |
|---|---|
| Public | `/`, `/apply` |
| Auth | `/login`, `/register` |
| Admin | `/admin`, `/admin/campaigns`, `/admin/creators`, `/admin/brands`, `/admin/submissions`, `/admin/payments` |
| Brand | `/brand`, `/brand/campaigns`, `/brand/campaigns/[id]`, `/brand/invoices`, `/brand/reports` |
| Creator | `/creator`, `/creator/campaigns`, `/creator/campaigns/[id]`, `/creator/tasks`, `/creator/submissions`, `/creator/earnings`, `/creator/applications` |
