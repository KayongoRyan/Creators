-- Rename MoMo contact fields to phone. Add clipping source asset path on campaigns.

alter table creators add column if not exists phone text not null default '';
update creators set phone = momo where coalesce(phone, '') = '' and coalesce(momo, '') <> '';

alter table creator_applications add column if not exists phone text not null default '';
update creator_applications
set phone = momo_phone
where coalesce(phone, '') = '' and coalesce(momo_phone, '') <> '';

alter table campaigns add column if not exists source_asset_path text;
