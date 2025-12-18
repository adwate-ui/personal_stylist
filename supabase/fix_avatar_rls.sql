-- Allow users to upload their own avatars
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Create bucket if missing (unlikely but safe)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Drop existing restrictive policies
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;

-- 3. Create correct policies
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
