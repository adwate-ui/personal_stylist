-- Allow users to upload their own avatars
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Create bucket if missing
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Drop policies we are about to create (to avoid conflicts)
-- We drop both potential old names AND the new names we use below
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Owner Update" on storage.objects;
drop policy if exists "Owner Delete" on storage.objects;

-- 3. Create policies
-- Allow public read
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated upload
create policy "Authenticated Upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

-- Allow owner update/delete
create policy "Owner Update"
  on storage.objects for update
  using ( bucket_id = 'avatars' and owner = auth.uid() );

create policy "Owner Delete"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and owner = auth.uid() );
