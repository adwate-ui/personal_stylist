-- Supabase Storage Setup for Personal Stylist App

-- 1. Create a public bucket for Wardrobe Items
-- 1. Create a public bucket for Wardrobe Items
insert into storage.buckets (id, name, public)
values ('wardrobe_items', 'wardrobe_items', true)
on conflict (id) do nothing;

-- 2. Create a public bucket for Temporary User Uploads
insert into storage.buckets (id, name, public)
values ('user_uploads', 'user_uploads', true)
on conflict (id) do nothing;

-- 3. Set up RLS (Row Level Security) Policies
-- Helper to drop policy if exists (Standard Postgres doesn't have CREATE POLICY IF NOT EXISTS)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access Wardrobe' and tablename = 'objects') then
    create policy "Public Access Wardrobe" on storage.objects for select using ( bucket_id = 'wardrobe_items' );
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Public Access User Uploads' and tablename = 'objects') then
    create policy "Public Access User Uploads" on storage.objects for select using ( bucket_id = 'user_uploads' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Allow Uploads Wardrobe' and tablename = 'objects') then
    create policy "Allow Uploads Wardrobe" on storage.objects for insert with check ( bucket_id = 'wardrobe_items' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Allow Uploads User Uploads' and tablename = 'objects') then
    create policy "Allow Uploads User Uploads" on storage.objects for insert with check ( bucket_id = 'user_uploads' );
  end if;
end $$;

-- 4. Create Wardrobe Items Table
create table if not exists wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- Optional: Link to Auth user if available
  image_url text not null,
  category text,
  sub_category text,
  brand text,
  primary_color text,
  price_estimate text,
  description text,
  style_tags text[], -- Array of strings
  style_score numeric, -- 0 to 100
  ai_analysis jsonb -- Complete JSON from Gemini
);

-- 5. RLS for Wardrobe Items
alter table wardrobe_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public Access Wardrobe Items' and tablename = 'wardrobe_items') then
    create policy "Public Access Wardrobe Items" on wardrobe_items for select using ( true );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Allow Insert Wardrobe Items' and tablename = 'wardrobe_items') then
    create policy "Allow Insert Wardrobe Items" on wardrobe_items for insert with check ( true );
  end if;
end $$;

-- Instructions:
-- 1. Go to your Supabase Project Dashboard.
-- 2. Open the "SQL Editor" from the sidebar.
-- 3. Click "New Query", paste the code above, and click "Run".
