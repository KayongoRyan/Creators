# Production deploy checklist

## Environment (API — `apps/api/.env` or host secrets)

| Variable | Production value |
|---|---|
| `AUTH_DEV` | `0` (disables `/auth/dev-token` and open admin signup) |
| `JWT_SECRET` | Long random secret (not the dev placeholder) |
| `CORS_ORIGINS` | Exact Next origins, comma-separated (e.g. `https://creators.example.com`) |
| `DATABASE_URL` | Postgres URI (`postgresql://…` or `postgresql+psycopg://…`) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Set for Supabase Auth + Storage; leave empty for local bcrypt-only |
| `SUPABASE_JWT_SECRET` | Project JWT secret when verifying HS256 Supabase tokens |

Never commit real service-role keys or production DB passwords.

## Frontend (Next)

```env
NEXT_PUBLIC_USE_MOCK=0
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

## Apply migrations

From `apps/api` with prod `DATABASE_URL` set:

```bash
pip install -e ".[postgres]"
python -m app.db.apply
```

This runs every `supabase/migrations/*.sql` in order (screenshots bucket last). See also `python -m app.db.migrate_status`.

## Supabase auth ID remap

After Auth users exist for demo (or production) emails:

```bash
cd apps/api
# Ensure .env has SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, DATABASE_URL
python scripts/seed_auth_users.py
```

Creates/updates Auth users for `admin@ubunifu.dev`, `brand@ubunifu.dev`, `creator@ubunifu.dev` (password `CreatorsDemo1!`) and remaps `profiles.id` → `auth.users.id`. Skip this step when using local bcrypt-only auth (empty `SUPABASE_URL`).

Migration status:

```bash
python -m app.db.migrate_status
```

## Docker

```bash
cd apps/api
docker build -t ugc-api .
docker run --rm -p 4000:4000 \
  -e AUTH_DEV=0 \
  -e JWT_SECRET=… \
  -e CORS_ORIGINS=https://app.example.com \
  -e DATABASE_URL=… \
  ugc-api
```

Health: `GET http://host:4000/api/health` → `{"ok":true}`.

## Live smoke (after deploy)

1. Clear portal localStorage keys (`creators_admin_state_v1`, brand/creator variants).
2. Walk [`PHASE4_QA.md`](PHASE4_QA.md) three-portal live checklist.
3. Confirm login returns JSON (not HTML) at `{API}/auth/login`.
