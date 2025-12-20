-- Create Outfits Table
create table if not exists outfits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  date date not null default CURRENT_DATE,
  occasion text not null,
  outfit_data jsonb not null, -- Stores the JSON structure of selected items
  feedback text -- Optional user notes
);

-- RLS Policies
alter table outfits enable row level security;

create policy "Users view own outfits" on outfits for select using (auth.uid() = user_id);
create policy "Users insert own outfits" on outfits for insert with check (auth.uid() = user_id);
create policy "Users update own outfits" on outfits for update using (auth.uid() = user_id);
create policy "Users delete own outfits" on outfits for delete using (auth.uid() = user_id);

-- Index
create index if not exists idx_outfits_user_date on outfits(user_id, date);
