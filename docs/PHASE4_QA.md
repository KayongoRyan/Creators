# Phase 4 — QA checklist

## Automated (run before merge)

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Mock mode (default)

`NEXT_PUBLIC_USE_MOCK` unset or not `0`. Full flows use localStorage:

| Key | Portal |
|---|---|
| `creators_admin_state_v1` | Admin |
| `creators_brand_state_v1` | Brand |
| `creators_creator_state_v1` | Creator |

### Interactions to verify

**Admin**

- [ ] Overview KPIs + pending actions update after actions elsewhere
- [ ] Create campaign: validation errors, success prepend, empty list copy
- [ ] Creators: accept/reject confirm, verification panel, empty pending
- [ ] Submissions: approve/reject/revision + note validation
- [ ] Payments: mark paid confirm, empty table copy

**Brand**

- [ ] Dashboard links → campaign detail
- [ ] Detail: post links, performance block, brief
- [ ] Invoices page

**Creator**

- [ ] Discover cards → detail (RPM / flat fee, deadline)
- [ ] Apply with pitch + confirm
- [ ] Tasks: submit URL validation + confirm → submissions + earnings pending
- [ ] Profile save

### UI states

- [ ] **Loading**: set `NEXT_PUBLIC_USE_MOCK=0` with API down → portal shows error + Retry (see layouts `*PortalGate`)
- [ ] **Empty**: clear localStorage keys above and refresh
- [ ] **Success**: normal mock flows above
- [ ] **Error (mutation)**: with mock off and API down, action still saves locally + amber API banner

## Responsive

Test at ~390px (mobile), ~768px (tablet), ≥1280px (desktop):

- [ ] Dashboard shell: horizontal nav scroll on mobile, fixed sidebar desktop
- [ ] Stat grids: 1 column → 3 columns (`min-[480px]`)
- [ ] Admin payments table: horizontal scroll
- [ ] Creator/brand cards and forms: no clipped buttons
- [ ] Confirm dialogs: fit small viewports

## Live API smoke (when backend ready)

1. Copy `.env.example` → `.env.local`, set `NEXT_PUBLIC_USE_MOCK=0` and `NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api`.
2. Start `npm run dev:api` + role portals (`dev:admin`, `dev:brand`, `dev:creator`).
3. Clear portal localStorage keys (see `docs/LOCAL_API.md`), then log in with demo accounts.
4. Reload portals — hydrate from `GET /admin|brand|creator/state`.
5. Exercise one POST per area; confirm 2xx or see action error banner.

### Three-portal live checklist

1. Clear portal localStorage (`creators_admin_state_v1`, `creators_brand_state_v1`, `creators_creator_state_v1`).
2. `USE_MOCK=0`, API up, log in as each role.
3. Brand creates campaign → appears under brand + admin campaigns (≤15s poll or refresh).
4. Creator applies to open campaign → admin Creators pending updates.
5. Admin approves submission → creator earnings + admin activity/audit update.
6. Admin uploads clipping source asset on a campaign → `sourceAssetPath` shows.
7. Admin lists (campaigns / submissions / payments) filter + paginate client-side.
8. Analytics traffic (visitors/pageViews) remains stubbed zeros; ops series is DB-derived.
9. Mock mode (`USE_MOCK` unset) still uses fixtures + localStorage.

Automated: `npm run test:api` and `npm run test:e2e` (API health + admin login). See [`DEPLOY.md`](DEPLOY.md).

## Known gaps (documented, not blockers for frontend demo)

- Admin, brand, and creator state are not synced in mock mode (separate stores)
- Legacy `getCampaigns()` services not used by portal pages
- No automated Playwright/Cypress suite yet
- Live auth uses `/auth/login` + `/auth/signup` (password-verified); mock mode still uses localStorage portals
- Web traffic KPIs (visitors/page views) stay stubbed until real telemetry; ops metrics come from DB
