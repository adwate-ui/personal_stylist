-- Create tables for Personal Stylist App
-- Idempotent version aligned with 001_unified_schema.sql

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================

create table if not exists profiles (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns carefully to handle existing tables
do $$
begin
  -- Basic fields
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
    alter table profiles add column full_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
    alter table profiles add column avatar_url text;
  end if;

  -- Physical attributes
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'height_cm') then
    alter table profiles add column height_cm integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'weight_kg') then
    alter table profiles add column weight_kg integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'body_type') then
    alter table profiles add column body_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'body_shape') then
    alter table profiles add column body_shape text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'gender') then
    alter table profiles add column gender text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'age') then
    alter table profiles add column age integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'date_of_birth') then
    alter table profiles add column date_of_birth date;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'skin_tone') then
    alter table profiles add column skin_tone text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'eye_color') then
    alter table profiles add column eye_color text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'hair_color') then
    alter table profiles add column hair_color text;
  end if;

  -- Style Preferences & DNA
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'style_preferences') then
    alter table profiles add column style_preferences text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'style_dna') then
    alter table profiles add column style_dna jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'lifestyle') then
    alter table profiles add column lifestyle jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'archetypes') then
    alter table profiles add column archetypes text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'brands') then
    alter table profiles add column brands text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'price_range') then
    alter table profiles add column price_range text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'fit_preference') then
    alter table profiles add column fit_preference text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'location') then
    alter table profiles add column location text;
  end if;
end $$;

-- RLS for profiles
alter table profiles enable row level security;
drop policy if exists "Users view own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;

create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);


-- ==========================================
-- 2. WARDROBE ITEMS
-- ==========================================

create table if not exists wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'image_url') then
    alter table wardrobe_items add column image_url text not null default '';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'category') then
    alter table wardrobe_items add column category text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'sub_category') then
    alter table wardrobe_items add column sub_category text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'brand') then
    alter table wardrobe_items add column brand text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'primary_color') then
    alter table wardrobe_items add column primary_color text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'price_estimate') then
    alter table wardrobe_items add column price_estimate text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'description') then
    alter table wardrobe_items add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'style_tags') then
    alter table wardrobe_items add column style_tags text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'style_score') then
    alter table wardrobe_items add column style_score numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'wardrobe_items' and column_name = 'ai_analysis') then
    alter table wardrobe_items add column ai_analysis jsonb;
  end if;
end $$;


-- RLS for wardrobe
alter table wardrobe_items enable row level security;
drop policy if exists "Users view own wardrobe" on wardrobe_items;
drop policy if exists "Users insert own wardrobe" on wardrobe_items;
drop policy if exists "Users update own wardrobe" on wardrobe_items;
drop policy if exists "Users delete own wardrobe" on wardrobe_items;

create policy "Users view own wardrobe" on wardrobe_items for select using (auth.uid() = user_id);
create policy "Users insert own wardrobe" on wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users update own wardrobe" on wardrobe_items for update using (auth.uid() = user_id);
create policy "Users delete own wardrobe" on wardrobe_items for delete using (auth.uid() = user_id);


-- ==========================================
-- 3. SHOPPING ITEMS
-- ==========================================

create table if not exists shopping_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'image_url') then
    alter table shopping_items add column image_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'product_link') then
    alter table shopping_items add column product_link text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'description') then
    alter table shopping_items add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'score') then
    alter table shopping_items add column score integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'ai_advice') then
    alter table shopping_items add column ai_advice text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'shopping_items' and column_name = 'purchased') then
    alter table shopping_items add column purchased boolean default false;
  end if;
end $$;

-- RLS for shopping items
alter table shopping_items enable row level security;
drop policy if exists "Users view own shopping items" on shopping_items;
drop policy if exists "Users manage own shopping items" on shopping_items;

create policy "Users view own shopping items" on shopping_items for select using (auth.uid() = user_id);
create policy "Users manage own shopping items" on shopping_items for all using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_wardrobe_items_user_id on wardrobe_items(user_id);
create index if not exists idx_wardrobe_items_category on wardrobe_items(category);
create index if not exists idx_shopping_items_user_id on shopping_items(user_id);
