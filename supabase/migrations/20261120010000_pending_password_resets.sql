-- Password-reset OTP challenges (60s TTL, single-use). App enforces expiry/consume.
create table if not exists pending_password_resets (
  email text primary key,
  expires_at text not null,
  consumed_at text,
  created_at text not null
);

create index if not exists pending_password_resets_expires_idx
  on pending_password_resets (expires_at);

alter table pending_password_resets enable row level security;
