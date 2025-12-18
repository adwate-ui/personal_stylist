-- Consolidated Migration for Unified Schema
-- Combines storage setup, secure RLS, and extended table structures

-- ==========================================
-- 1. STORAGE BUCKETS SETUP
-- ==========================================

-- Create buckets if they don't exist (using INSERT to allow conflict handling)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('wardrobe_items', 'wardrobe_items', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('user_uploads', 'user_uploads', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- 2. STORAGE RLS POLICIES
-- ==========================================

-- Enable RLS on storage.objects if not already enabled (it usually is)
-- alter table storage.objects enable row level security; -- Commented out to avoid 42501 "must be owner" error

-- Drop existing permissive policies if they exist (cleanup)
drop policy if exists "Public Access Wardrobe" on storage.objects;
drop policy if exists "Public Access User Uploads" on storage.objects;
drop policy if exists "Allow Uploads Wardrobe" on storage.objects;
drop policy if exists "Allow Uploads User Uploads" on storage.objects;

-- Create User-Scoped Policies

-- Wardrobe Items Bucket
create policy "Users view own wardrobe images" 
  on storage.objects for select 
  using (bucket_id = 'wardrobe_items' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own wardrobe images" 
  on storage.objects for insert 
  with check (bucket_id = 'wardrobe_items' and auth.uid()::text = (storage.foldername(name))[1]);

-- User Uploads Bucket
create policy "Users view own temp uploads" 
  on storage.objects for select 
  using (bucket_id = 'user_uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own temp uploads" 
  on storage.objects for insert 
  with check (bucket_id = 'user_uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Avatars Bucket
create policy "Users view own avatars" 
  on storage.objects for select 
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own avatars" 
  on storage.objects for insert 
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);


-- ==========================================
-- 3. DATABASE TABLES
-- ==========================================

-- A. PROFILES TABLE
-- Create if not exists, then ensure all columns exist
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns if they don't exist (using idempotent ALTER statements or CREATE if new)
-- Basic fields
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists avatar_url text;

-- Physical attributes
alter table profiles add column if not exists height_cm integer;
alter table profiles add column if not exists weight_kg integer;
alter table profiles add column if not exists body_type text;
alter table profiles add column if not exists body_shape text;
alter table profiles add column if not exists gender text;
alter table profiles add column if not exists age integer;
alter table profiles add column if not exists date_of_birth date; -- Alternative to age if needed, but keeping age as requested
alter table profiles add column if not exists skin_tone text;
alter table profiles add column if not exists eye_color text;
alter table profiles add column if not exists hair_color text;

-- Style Preferences & DNA
alter table profiles add column if not exists style_preferences text[];
alter table profiles add column if not exists style_dna jsonb;
alter table profiles add column if not exists lifestyle jsonb;
alter table profiles add column if not exists archetypes text[];
alter table profiles add column if not exists brands text[];
alter table profiles add column if not exists price_range text;
alter table profiles add column if not exists fit_preference text;

alter table profiles add column if not exists location text;
alter table profiles add column if not exists gemini_api_key text;


-- B. WARDROBE ITEMS TABLE
-- Structure from api route requirements
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

-- C. SHOPPING ITEMS TABLE
create table if not exists shopping_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  image_url text,
  product_link text,
  description text,
  score integer,
  ai_advice text,
  purchased boolean default false
);


-- ==========================================
-- 4. TABLE RLS POLICIES
-- ==========================================

-- Enable RLS
alter table profiles enable row level security;
alter table wardrobe_items enable row level security;
alter table shopping_items enable row level security;

-- PROFILES Policies
drop policy if exists "Users view own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;

create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- WARDROBE ITEMS Policies
drop policy if exists "Public Access Wardrobe Items" on wardrobe_items; -- Drop old insecure policy
drop policy if exists "Allow Insert Wardrobe Items" on wardrobe_items; -- Drop old insecure policy
drop policy if exists "Users view own wardrobe" on wardrobe_items;

create policy "Users view own wardrobe" on wardrobe_items for select using (auth.uid() = user_id);
create policy "Users insert own wardrobe" on wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users update own wardrobe" on wardrobe_items for update using (auth.uid() = user_id);
create policy "Users delete own wardrobe" on wardrobe_items for delete using (auth.uid() = user_id);

-- SHOPPING ITEMS Policies
drop policy if exists "Users view own shopping items" on shopping_items;

create policy "Users view own shopping items" on shopping_items for select using (auth.uid() = user_id);
create policy "Users manage own shopping items" on shopping_items for all using (auth.uid() = user_id);


-- ==========================================
-- 5. INDEXES FOR PERFORMANCE
-- ==========================================

create index if not exists idx_wardrobe_items_user_id on wardrobe_items(user_id);
create index if not exists idx_wardrobe_items_category on wardrobe_items(category);
create index if not exists idx_wardrobe_items_created_at on wardrobe_items(created_at desc);
create index if not exists idx_shopping_items_user_id on shopping_items(user_id);
