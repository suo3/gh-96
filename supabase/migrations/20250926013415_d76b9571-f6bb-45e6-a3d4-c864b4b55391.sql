-- Add distributor_id column to featured_sellers table
ALTER TABLE featured_sellers ADD COLUMN distributor_id UUID REFERENCES distributor_profiles(id) ON DELETE CASCADE;

-- Add constraint to ensure either user_id or distributor_id is set, but not both
ALTER TABLE featured_sellers ADD CONSTRAINT featured_sellers_single_reference_check 
CHECK (
  (user_id IS NOT NULL AND distributor_id IS NULL) OR 
  (user_id IS NULL AND distributor_id IS NOT NULL)
);