-- Create tables for Personal Stylist App

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  height_cm integer,
  weight_kg integer,
  body_type text, -- e.g., 'hourglass', 'athletic'
  style_preferences text[], -- array of styles e.g. ['minimalist', 'boho']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Wardrobe Items
create table wardrobe_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  image_url text not null,
  category text, -- 'top', 'bottom', 'shoes', etc.
  sub_category text, -- 't-shirt', 'jeans'
  primary_color text,
  secondary_color text,
  season text[], -- ['summer', 'winter']
  brand text,
  wear_count integer default 0,
  score integer, -- AI given score 1-10
  critique text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for wardrobe
alter table wardrobe_items enable row level security;
create policy "Users can view own wardrobe" on wardrobe_items for select using (auth.uid() = user_id);
create policy "Users can insert own wardrobe" on wardrobe_items for insert with check (auth.uid() = user_id);
create policy "Users can update own wardrobe" on wardrobe_items for update using (auth.uid() = user_id);
create policy "Users can delete own wardrobe" on wardrobe_items for delete using (auth.uid() = user_id);

-- Shopping Items / Wishlist
create table shopping_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  image_url text,
  product_link text,
  description text,
  score integer,
  ai_advice text,
  purchased boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for shopping items
alter table shopping_items enable row level security;
create policy "Users can view own shopping items" on shopping_items for select using (auth.uid() = user_id);
create policy "Users can manage own shopping items" on shopping_items for all using (auth.uid() = user_id);

-- Storage buckets setup (to be done in Supabase Dashboard or via API)
-- Bucket: 'wardrobe', 'avatars'
