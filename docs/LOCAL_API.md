# Local API (no Supabase)

Production checklist and Docker: [`DEPLOY.md`](DEPLOY.md).

## Start

```bash
# API (:4000) + Next (:3000) together
npm run dev:all

# Same + role portals (:3001 admin, :3002 brand, :3003 creator)
npm run dev:stack

# Or separately:
npm run dev:api
npm run dev
```

## Frontend (`.env.local`)

```env
NEXT_PUBLIC_USE_MOCK=0
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api
```

Restart Next after env changes.

## API (`apps/api/.env`)

Copy `apps/api/.env.example`. Leave `SUPABASE_*` empty for bcrypt auth on SQLite.

```env
AUTH_DEV=1
JWT_SECRET=dev-only-change-me-please-32b
```

First boot runs `python -m app.db.apply` logic via API lifespan (seed + demo password hashes).

## Demo logins

| Email | Password | Role |
|--------|----------|------|
| `admin@ubunifu.dev` | `CreatorsDemo1!` | admin |
| `admin@creators.rw` | `CreatorsDemo1!` | admin |
| `brand@ubunifu.dev` | `CreatorsDemo1!` | brand |
| `creator@ubunifu.dev` | `CreatorsDemo1!` | creator |

New signups: 8+ chars, upper, lower, digit, no spaces.

## Checks

```bash
curl -s http://127.0.0.1:4000/api/health
npm run test:api
```

If login returns HTML, FastAPI is not running or `NEXT_PUBLIC_API_URL` points at the wrong host.

## Existing SQLite DB

Restart API once; `ensure_demo_passwords` backfills demo hashes. Or delete `apps/api/.data/ugc.db` and restart.

## Switching mock → live admin

After setting `NEXT_PUBLIC_USE_MOCK=0`, clear stale fixture snapshots in the browser console:

```js
localStorage.removeItem('creators_admin_state_v1')
localStorage.removeItem('creators_brand_state_v1')
localStorage.removeItem('creators_creator_state_v1')
```

Then refresh. Admin analytics/audit come from the API (DB-derived), not fixture charts.