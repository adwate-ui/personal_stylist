-- Rollback script for 001_unified_schema.sql
-- WARNING: This will drop columns and tables, potentially causing data loss.

-- 1. Drop Indexes
drop index if exists idx_wardrobe_items_user_id;
drop index if exists idx_wardrobe_items_category;
drop index if exists idx_wardrobe_items_created_at;
drop index if exists idx_shopping_items_user_id;

-- 2. Drop Tables (if you want to fully revert, otherwise just drop columns)
-- We will keep the tables but revert the columns added to profiles if possible, 
-- but given this is a consolidation, we might want to just clean up the "new" stuff.
-- However, for a clean rollback to "pre-migration" state (assuming empty state or old state),
-- we should technically remove what we added. 

-- Since `wardrobe_items` might have existed from `supabase_setup.sql`, dropping it might be dangerous if there was data.
-- But `profiles` columns definitely need to go.

alter table profiles drop column if exists location;
alter table profiles drop column if exists fit_preference;
alter table profiles drop column if exists price_range;
alter table profiles drop column if exists brands;
alter table profiles drop column if exists archetypes;
alter table profiles drop column if exists lifestyle;
alter table profiles drop column if exists style_dna;
alter table profiles drop column if exists style_preferences;
alter table profiles drop column if exists hair_color;
alter table profiles drop column if exists eye_color;
alter table profiles drop column if exists skin_tone;
alter table profiles drop column if exists date_of_birth;
alter table profiles drop column if exists age;
alter table profiles drop column if exists gender;
alter table profiles drop column if exists body_shape;

-- 3. Drop Policies
drop policy if exists "Users view own wardrobe images" on storage.objects;
drop policy if exists "Users upload own wardrobe images" on storage.objects;
drop policy if exists "Users view own temp uploads" on storage.objects;
drop policy if exists "Users upload own temp uploads" on storage.objects;
drop policy if exists "Users view own avatars" on storage.objects;
drop policy if exists "Users upload own avatars" on storage.objects;

drop policy if exists "Users view own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;

drop policy if exists "Users view own wardrobe" on wardrobe_items;
drop policy if exists "Users insert own wardrobe" on wardrobe_items;
drop policy if exists "Users update own wardrobe" on wardrobe_items;
drop policy if exists "Users delete own wardrobe" on wardrobe_items;

drop policy if exists "Users view own shopping items" on shopping_items;
drop policy if exists "Users manage own shopping items" on shopping_items;

-- 4. Revert Storage Buckets (Optional - usually better to keep them, but here is how to kill them)
-- delete from storage.buckets where id in ('wardrobe_items', 'user_uploads', 'avatars');
