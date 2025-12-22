-- Add image_extractor_api_key to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS image_extractor_api_key TEXT;

-- Update RLS policy if needed (usually public profile policy covers it, but nice to verify)
-- No specific RLS change needed if the existing policy covers "update own profile"
