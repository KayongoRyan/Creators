# Email OTP signup (creators & brands)

Creator and brand accounts must confirm email with a **6-digit OTP** before the portal issues an API session. Admin signup stays one-shot (dev / provisioned).

## Supabase dashboard (required)

Project settings → **Authentication**:

1. **Providers → Email**
   - Enable email signups.
   - Enable **Confirm email**.
   - Prefer **OTP / 6-digit code** for Confirm signup (not magic-link-only).

2. **SMTP Settings**
   - Enable **custom SMTP** (Resend, SendGrid, SES, etc.).
   - Set host, port, username, password, and a verified **From** address.
   - Add SPF/DKIM for that domain so OTP mail is not spam-filtered.

3. **Email Templates → Confirm signup**
   - Body must include the OTP: `{{ .Token }}` (Supabase default OTP template).

4. **Auth rate limits / OTP expiry**
   - Keep OTP expiry around 10–15 minutes; respect provider rate limits.

## API env

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=...          # required for signup/start + OTP verify
SUPABASE_SERVICE_ROLE_KEY=...  # admin provisioning / storage
AUTH_DEV=0                     # production
# AUTH_EMAIL_OTP_BYPASS=1      # ONLY with AUTH_DEV=1 — skips Supabase OTP for local SQLite
```

`SUPABASE_ANON_KEY` is required whenever Supabase Auth is enabled: public signup and OTP verify use the anon key, not the service role.

## Client flow

1. Join wizard (`/join`) collects profile + password, then `POST /api/auth/signup/start`.
2. Browser redirects to **`/verify`** (OTP page) with pending signup in `sessionStorage`.
3. User enters the 6-digit code → `POST /api/auth/signup/verify` → HS256 `accessToken` + workspace redirect.
4. Optional resend on `/verify` → `POST /api/auth/signup/resend`.

Login (`POST /api/auth/login`) remains email + password after confirmation. Unconfirmed users get a clear “verify your email” error when Supabase reports `email_not_confirmed`.

## Local / no SMTP

- Without Supabase keys: local bcrypt signup (no OTP) for tests.
- With `AUTH_DEV=1` and `AUTH_EMAIL_OTP_BYPASS=1`: `signup/start` creates a pending row; `signup/verify` accepts token `000000` without calling Supabase. **Never enable in production.**
