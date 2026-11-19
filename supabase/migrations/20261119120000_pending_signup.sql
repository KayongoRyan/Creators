-- Staging for creator/brand signup payload until email OTP is verified.
create table if not exists pending_signups (
  id text primary key,
  email text not null,
  role text not null,
  payload jsonb not null default '{}'::jsonb,
  supabase_user_id text,
  expires_at text not null,
  created_at text not null
);

create unique index if not exists pending_signups_email_uidx on pending_signups (email);
create index if not exists pending_signups_expires_idx on pending_signups (expires_at);

alter table pending_signups enable row level security;
