-- Supabase Storage Setup for Personal Stylist App

-- 1. Create a public bucket for Wardrobe Items
insert into storage.buckets
  (id, name, public)
values
  ('wardrobe_items', 'wardrobe_items', true);

-- 2. Create a public bucket for Temporary User Uploads (e.g., during onboarding)
insert into storage.buckets
  (id, name, public)
values
  ('user_uploads', 'user_uploads', true);

-- 3. Set up RLS (Row Level Security) Policies
-- ALLOW READ access to everyone (public buckets)
create policy "Public Access Wardrobe"
  on storage.objects for select
  using ( bucket_id = 'wardrobe_items' );

create policy "Public Access User Uploads"
  on storage.objects for select
  using ( bucket_id = 'user_uploads' );

-- ALLOW INSERT access to everyone (For this prototype. In production, restrict to authenticated users)
create policy "Allow Uploads Wardrobe"
  on storage.objects for insert
  with check ( bucket_id = 'wardrobe_items' );

create policy "Allow Uploads User Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'user_uploads' );

-- Instructions:
-- 1. Go to your Supabase Project Dashboard.
-- 2. Open the "SQL Editor" from the sidebar.
-- 3. Click "New Query", paste the code above, and click "Run".
