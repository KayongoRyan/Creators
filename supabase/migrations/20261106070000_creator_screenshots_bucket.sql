insert into storage.buckets (id, name, public)
values ('creator-screenshots', 'creator-screenshots', false)
on conflict (id) do nothing;

drop policy if exists "creator_screenshots_service_insert" on storage.objects;
drop policy if exists "creator_screenshots_service_select" on storage.objects;
drop policy if exists "creator_screenshots_service_update" on storage.objects;

create policy "creator_screenshots_service_insert"
on storage.objects for insert to service_role
with check (bucket_id = 'creator-screenshots');

create policy "creator_screenshots_service_select"
on storage.objects for select to service_role
using (bucket_id = 'creator-screenshots');

create policy "creator_screenshots_service_update"
on storage.objects for update to service_role
using (bucket_id = 'creator-screenshots')
with check (bucket_id = 'creator-screenshots');
