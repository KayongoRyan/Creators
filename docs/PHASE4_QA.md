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

1. Copy `.env.example` → `.env.local`, set `NEXT_PUBLIC_USE_MOCK=0` and `NEXT_PUBLIC_API_URL`.
2. Implement at minimum `GET /admin/state`, `GET /brand/state`, `GET /creator/state`.
3. Reload portals — should hydrate from API once, no duplicate fetches (Context providers in layouts).
4. Exercise one POST per area; confirm 2xx or see action error banner.

## Known gaps (documented, not blockers for frontend demo)

- Admin, brand, and creator state are not synced in mock mode (separate stores)
- Legacy `getCampaigns()` services not used by portal pages
- No automated Playwright/Cypress suite yet
- Auth is demo localStorage only
