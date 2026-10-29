# Creators

Workspace for brands and creators. Brands post campaigns. Creators apply. Submissions come back on the same brief.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Commands

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run dev:admin
```

Starts the same app and opens [http://localhost:3000/admin](http://localhost:3000/admin) signed in as the admin demo. Stop any other `next dev` first so port 3000 is free.

If you see `__webpack_modules__[moduleId] is not a function`, a stale dev server is almost always the cause (do not delete `.next` while `next dev` is still running). Stop every dev terminal with Ctrl+C, then:

```bash
npm run dev:clean
```

```bash
npm run build
```

```bash
npm run start
```

```bash
npm run lint
```

Work on `Ryan`, not `main`:

```bash
git checkout Ryan
git add .
git commit -m "your message"
git push origin Ryan
```

## Env

Copy these into `.env.local` if you need them. Defaults work for local mock data.

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | API base URL |
| `NEXT_PUBLIC_USE_MOCK` | on | Set to `0` when a real API is wired |

## Architecture

Pages stay thin. Domain UI and data live in `features/`. Shared chrome lives in `components/`.

```
src/
├── app/                 # routes only
│   ├── (public)/        # marketing: / and /apply
│   ├── (auth)/          # /login, /register
│   ├── admin/
│   ├── brand/
│   └── creator/
├── components/
│   ├── ui/              # primitives
│   ├── layout/          # dashboard shells
│   ├── marketing/       # public site
│   └── shared/
├── features/            # auth, campaigns, creators, brands, submissions, …
├── lib/                 # api client, formatters, validators, utils
├── hooks/
├── types/
└── config/              # routes, navigation, site
```

**Conventions**

1. New page → `app/.../page.tsx` as a thin server component.
2. Data + UI → `features/<domain>/services/` and `features/<domain>/components/`.
3. Re-export from `features/<domain>/index.ts`.
4. Links and nav → `config/routes.ts` and `config/navigation.ts`.

## Routes

| Area | Paths |
|---|---|
| Public | `/`, `/apply` |
| Auth | `/login`, `/register` |
| Admin | `/admin`, `/admin/campaigns`, `/admin/creators`, `/admin/brands`, `/admin/submissions`, `/admin/payments` |
| Brand | `/brand`, `/brand/campaigns`, `/brand/reports` |
| Creator | `/creator`, `/creator/campaigns`, `/creator/applications`, `/creator/submissions`, `/creator/earnings` |

Default branch is `main`. Work happens on `Ryan`.

Repo: [github.com/KayongoRyan/Creators](https://github.com/KayongoRyan/Creators)
