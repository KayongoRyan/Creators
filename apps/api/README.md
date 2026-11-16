# UGC Rwanda API

Modular monolith for the creator marketplace. One process, one database, modules under `app/modules` (`identity`, `creators`, `campaigns`, `submissions`, `payouts`, `reporting`).

## Run

From the repo root:

```bash
npm run dev:api
```

Or from this directory:

```bash
pip install -e ".[dev]"
python -m app.db.apply
python -m uvicorn app.main:app --host 127.0.0.1 --port 4000 --reload
```

Health: `GET http://localhost:4000/api/health`

Point the web app at it with `NEXT_PUBLIC_API_URL=http://localhost:4000/api` and `NEXT_PUBLIC_USE_MOCK=0`.

## Tests

```bash
python -m pytest
```

## Database

- Default: SQLite at `.data/ugc.db`, schema from SQLAlchemy models, seeded on first boot.
- Supabase/Postgres: set `DATABASE_URL` to a `postgresql://` URL. `python -m app.db.apply` runs [`supabase/migrations/20261106000000_init.sql`](../../supabase/migrations/20261106000000_init.sql) (RLS included; needs the Supabase `auth` schema).

Seeded dev users (view switcher emails):

| Email | Role |
|---|---|
| `admin@ubunifu.dev` | admin |
| `brand@ubunifu.dev` | brand (Primus) |
| `creator@ubunifu.dev` | creator (Marie K.) |

- `POST /api/auth/signup` / `POST /api/auth/login` — email + password against Supabase Auth. Login never creates a profile. Role comes from `app_metadata.role`, then the `profiles` row (`id` = `auth.uid()`).
- Demo accounts: `admin@ubunifu.dev`, `brand@ubunifu.dev`, `creator@ubunifu.dev` / `CreatorsDemo1!`.
- `POST /api/auth/dev-token` is lookup-only while `AUTH_DEV=1` (tests). Supabase access tokens are ES256 and verified via JWKS.

Screenshots: Supabase Storage bucket `creator-screenshots` when both Supabase env vars are set, otherwise `uploads/`.
