-- UGC Rwanda MVP schema. Apply with the Supabase CLI (`supabase db push`)
-- or `python -m app.db.apply` when DATABASE_URL is a Postgres connection string.
-- Requires the Supabase `auth` schema for the RLS policies below.

create table if not exists brands (
  id text primary key,
  name text not null,
  legal_name text not null,
  company_line text not null default ''
);

create table if not exists creators (
  id text primary key,
  display_name text not null,
  tiktok_handle text not null default '',
  instagram_handle text not null default '',
  tiktok_followers integer not null default 0,
  instagram_followers integer not null default 0,
  niche text not null default '',
  momo text not null default '',
  label text not null default 'New',
  campaigns_completed integer not null default 0
);

create table if not exists profiles (
  id text primary key,
  email text not null unique,
  role text not null,
  display_name text not null,
  brand_id text references brands (id),
  creator_id text references creators (id)
);

create table if not exists creator_applications (
  id text primary key,
  full_name text not null,
  email text,
  tiktok_handle text not null default '',
  instagram_handle text not null default '',
  tiktok_followers integer not null default 0,
  instagram_followers integer not null default 0,
  niche text not null default '',
  momo_phone text not null default '',
  screenshot_path text,
  why_join text,
  status text not null default 'pending',
  created_at text not null
);

create table if not exists campaigns (
  id text primary key,
  brand_id text not null references brands (id),
  title text not null,
  brand_portal_title text,
  status text not null,
  budget_rwf bigint not null,
  created_at text not null,
  campaign_type text not null,
  deadline text not null default '',
  fee_percent integer not null default 20,
  assigned_creators integer not null default 0,
  submissions_received integer not null default 0,
  submissions_approved integer not null default 0,
  content_kind text not null default 'ugc',
  setup_fee_rwf bigint not null default 0,
  platform_fee_rwf bigint not null default 0,
  creator_pool_rwf bigint not null default 0,
  pool_remaining_rwf bigint not null default 0,
  rpm_rwf bigint not null default 1500,
  min_views integer not null default 0,
  min_payout_rwf bigint not null default 0,
  max_payout_rwf bigint,
  view_snapshot_at text,
  payout_due_at text,
  brief text not null default '',
  assignment_mode text not null default 'open',
  funded_at text,
  run_period text not null default '',
  fee_rwf bigint not null default 0,
  engagement_rate text not null default '0%',
  spend_rwf bigint not null default 0,
  total_views integer not null default 0,
  spots_left integer not null default 0,
  is_open boolean not null default false,
  flat_payout_rwf bigint,
  listed_in_admin boolean not null default true,
  listed_in_discover boolean not null default false,
  listed_in_brand boolean not null default false
);

create table if not exists campaign_applications (
  id text primary key,
  campaign_id text not null references campaigns (id),
  creator_id text not null references creators (id),
  status text not null default 'pending',
  pitch text,
  applied_at text not null
);

create table if not exists assignments (
  id text primary key,
  campaign_id text not null references campaigns (id),
  creator_id text not null references creators (id),
  title text not null,
  brief text not null default '',
  source_url text,
  payout_rwf bigint not null default 0,
  deadline text not null default '',
  post_url text,
  status text not null default 'not_submitted'
);

create table if not exists submissions (
  id text primary key,
  campaign_id text not null references campaigns (id),
  creator_id text not null references creators (id),
  assignment_id text references assignments (id),
  status text not null,
  post_url text,
  revision_note text,
  submitted_at text not null,
  views integer
);

create table if not exists brand_posts (
  id text primary key,
  campaign_id text not null references campaigns (id),
  submission_id text references submissions (id),
  creator_name text not null,
  handle text not null,
  platform text not null,
  followers_label text not null,
  post_url text,
  views integer,
  status text not null
);

create table if not exists payouts (
  id text primary key,
  creator_id text references creators (id),
  campaign_id text references campaigns (id),
  submission_id text references submissions (id),
  creator_name text not null,
  handle text not null,
  campaign_title text not null,
  amount_rwf bigint not null,
  status text not null,
  views_at_snapshot integer,
  paid_at text
);

create table if not exists creator_earnings (
  id text primary key,
  creator_id text not null references creators (id),
  campaign_title text not null,
  amount_rwf bigint not null,
  status text not null,
  payout_date text,
  payout_id text references payouts (id)
);

create table if not exists brand_invoices (
  id text primary key,
  brand_id text not null references brands (id),
  campaign_id text references campaigns (id),
  label text not null,
  creator_budget_rwf bigint not null,
  fee_rwf bigint not null,
  setup_fee_rwf bigint not null default 0,
  total_rwf bigint not null,
  status text not null
);

create table if not exists brand_collections (
  id text primary key,
  brand_id text references brands (id),
  campaign_id text references campaigns (id),
  label text not null,
  amount_rwf bigint not null,
  status text not null
);

create table if not exists admin_events (
  id text primary key,
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text not null default '',
  created_at text not null
);

create table if not exists idempotency_keys (
  id text primary key,
  response_json text not null
);

create index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_role_idx on profiles (role);
create index if not exists creator_applications_status_idx on creator_applications (status);
create index if not exists campaigns_status_idx on campaigns (status);
create index if not exists campaigns_brand_idx on campaigns (brand_id);
create index if not exists submissions_status_idx on submissions (status);
create index if not exists payouts_status_idx on payouts (status);

alter table profiles enable row level security;
alter table creators enable row level security;
alter table brands enable row level security;
alter table creator_applications enable row level security;
alter table campaigns enable row level security;
alter table campaign_applications enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table brand_posts enable row level security;
alter table payouts enable row level security;
alter table creator_earnings enable row level security;
alter table brand_invoices enable row level security;
alter table brand_collections enable row level security;
alter table admin_events enable row level security;
alter table idempotency_keys enable row level security;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (auth.uid()::text = id);

drop policy if exists creators_select_own on creators;
create policy creators_select_own on creators
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()::text
        and profiles.creator_id = creators.id
    )
  );

drop policy if exists brands_select_own on brands;
create policy brands_select_own on brands
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()::text
        and profiles.brand_id = brands.id
    )
  );

drop policy if exists campaigns_select_member on campaigns;
create policy campaigns_select_member on campaigns
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()::text
        and (
          profiles.role = 'admin'
          or profiles.brand_id = campaigns.brand_id
          or profiles.role = 'creator'
        )
    )
  );

drop policy if exists submissions_select_own on submissions;
create policy submissions_select_own on submissions
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()::text
        and (
          profiles.role = 'admin'
          or profiles.creator_id = submissions.creator_id
        )
    )
  );

drop policy if exists payouts_select_own on payouts;
create policy payouts_select_own on payouts
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()::text
        and (
          profiles.role = 'admin'
          or profiles.creator_id = payouts.creator_id
        )
    )
  );

grant select on profiles, creators, brands, campaigns, submissions, payouts,
  assignments, campaign_applications, creator_earnings, brand_invoices, brand_posts
  to authenticated;
