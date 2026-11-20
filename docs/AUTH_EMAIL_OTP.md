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

4. **Email Templates → Reset password** (recovery)
   - Same as signup: include `{{ .Token }}` so the recovery email carries a **6-digit OTP** (not magic-link-only). Custom SMTP from step 2 is reused.

5. **Auth rate limits / OTP expiry**
   - Set **OTP expiry to 60 seconds** (signup + recovery). Codes are single-use; the API also enforces 60s + consume-after-verify.

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
3. User enters the 6-digit code within **60 seconds** (single-use) → `POST /api/auth/signup/verify` → HS256 `accessToken` + workspace redirect.
4. After expiry, resend on `/verify` → `POST /api/auth/signup/resend` (issues a fresh 60s code).

Login (`POST /api/auth/login`) remains email + password after confirmation. Unconfirmed users get a clear “verify your email” error when Supabase reports `email_not_confirmed`.

## Forgot password (email OTP)

Same OTP pattern as signup (not magic links):

1. Login UI → **Forgot password?** → `/forgot-password` → `POST /api/auth/password/forgot` (always `{ ok: true }`, no email enumeration).
2. Redirect to `/reset-password` with pending email in `sessionStorage`.
3. User enters 6-digit recovery code + new password within **60 seconds** (single-use) → `POST /api/auth/password/reset` → HS256 `accessToken` + role from `profiles`.
4. After expiry, resend → `POST /api/auth/password/resend`.

Supabase path: `POST /auth/v1/recover` (or recovery resend), then `POST /auth/v1/verify` with `type: "recovery"`, then `PUT /auth/v1/user` with the new password.

## Local / no SMTP

- Without Supabase keys: local bcrypt signup (no OTP) for tests.
- With `AUTH_DEV=1` and `AUTH_EMAIL_OTP_BYPASS=1`: `signup/start` creates a pending row; `signup/verify` accepts token `000000` without calling Supabase. Password reset accepts `000000` the same way. **Never enable in production.**
