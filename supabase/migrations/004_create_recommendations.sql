-- Create a table to store weekly recommendations
create table if not exists public.weekly_recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start_date date not null,
  recommendations jsonb not null, -- Stores the array of recommended items
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure only one record per user per week
  unique(user_id, week_start_date)
);

-- Enable RLS
alter table public.weekly_recommendations enable row level security;

-- Policies
create policy "Users can view their own recommendations"
  on public.weekly_recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recommendations"
  on public.weekly_recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recommendations"
  on public.weekly_recommendations for update
  using (auth.uid() = user_id);
