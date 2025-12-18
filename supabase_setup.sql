-- Supabase Storage & Database Setup for Personal Stylist App
-- Aligning with 001_unified_schema.sql

-- ==========================================
-- 1. STORAGE BUCKETS SETUP
-- ==========================================

-- Create buckets if they don't exist (using INSERT to allow conflict handling)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('wardrobe_items', 'wardrobe_items', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('user_uploads', 'user_uploads', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- 2. STORAGE RLS POLICIES
-- ==========================================

-- Drop existing permissive policies if they exist (cleanup)
drop policy if exists "Public Access Wardrobe" on storage.objects;
drop policy if exists "Public Access User Uploads" on storage.objects;
drop policy if exists "Allow Uploads Wardrobe" on storage.objects;
drop policy if exists "Allow Uploads User Uploads" on storage.objects;
-- Cleanup old/conflicting policies
drop policy if exists "Users view own wardrobe images" on storage.objects;
drop policy if exists "Users upload own wardrobe images" on storage.objects;
drop policy if exists "Users upload to own folder" on storage.objects;
drop policy if exists "Users view own temp uploads" on storage.objects;
drop policy if exists "Users upload own temp uploads" on storage.objects;
drop policy if exists "Users upload to own temp folder" on storage.objects;
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Authenticated users upload avatars" on storage.objects;

-- Create User-Scoped Policies

-- Wardrobe Items Bucket (Public Read, Authenticated Upload)
-- Public access allows viewing, policy restricts uploads to own folder
create policy "Users view own wardrobe images" 
  on storage.objects for select 
  using (bucket_id = 'wardrobe_items' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload to own folder" 
  on storage.objects for insert 
  with check (bucket_id = 'wardrobe_items' and auth.uid()::text = (storage.foldername(name))[1]);

-- User Uploads Bucket (Public Read, Authenticated Upload)
create policy "Users view own temp uploads" 
  on storage.objects for select 
  using (bucket_id = 'user_uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload to own temp folder" 
  on storage.objects for insert 
  with check (bucket_id = 'user_uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars Bucket (Public Read, Authenticated Upload)
create policy "Public read avatars" 
  on storage.objects for select 
  using (bucket_id = 'avatars');

create policy "Authenticated users upload avatars" 
  on storage.objects for insert 
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');


-- ==========================================
-- 3. WARDROBE ITEMS TABLE
-- ==========================================

create table if not exists wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  image_url text not null,
  category text,
  sub_category text,
  brand text,
  primary_color text,
  price_estimate text,
  description text,
  style_tags text[],
  style_score numeric,
  ai_analysis jsonb
);

-- ==========================================
-- 4. TABLE RLS POLICIES
-- ==========================================

alter table wardrobe_items enable row level security;

-- Drop old policies if they exist
drop policy if exists "Public Access Wardrobe Items" on wardrobe_items;
drop policy if exists "Allow Insert Wardrobe Items" on wardrobe_items;
-- Cleanup existing user-scoped policies
drop policy if exists "Users view own wardrobe" on wardrobe_items;
drop policy if exists "Users insert own wardrobe" on wardrobe_items;
drop policy if exists "Users update own wardrobe" on wardrobe_items;
drop policy if exists "Users delete own wardrobe" on wardrobe_items;

-- Create new user-scoped policies
create policy "Users view own wardrobe" on wardrobe_items for select using (auth.uid() = user_id);
create policy "Users insert own wardrobe" on wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users update own wardrobe" on wardrobe_items for update using (auth.uid() = user_id);
create policy "Users delete own wardrobe" on wardrobe_items for delete using (auth.uid() = user_id);

-- ==========================================
-- 5. INDEXES
-- ==========================================

create index if not exists idx_wardrobe_items_user_id on wardrobe_items(user_id);
create index if not exists idx_wardrobe_items_category on wardrobe_items(category);
create index if not exists idx_wardrobe_items_created_at on wardrobe_items(created_at desc);
