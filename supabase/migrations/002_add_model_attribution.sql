-- Migration: Add model attribution to wardrobe items
-- Created: 2025-12-19
-- Description: Add generated_by_model column to track which AI model analyzed each item

ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS generated_by_model TEXT;

-- Add comment for documentation
COMMENT ON COLUMN wardrobe_items.generated_by_model IS 'Tracks which Gemini model (e.g., gemini-3-pro-preview) analyzed this wardrobe item';
