
-- Ensure the ratings table has proper RLS policies
-- First, enable RLS if not already enabled
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;

-- Create comprehensive RLS policies for ratings
CREATE POLICY "Users can view all ratings" 
  ON public.ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create ratings" 
  ON public.ratings 
  FOR INSERT 
  WITH CHECK (auth.uid() = rater_user_id AND auth.uid() != rated_user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.ratings 
  FOR UPDATE 
  USING (auth.uid() = rater_user_id);

CREATE POLICY "Users can delete their own ratings" 
  ON public.ratings 
  FOR DELETE 
  USING (auth.uid() = rater_user_id);

-- Add index for better performance when fetching user ratings
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user_id ON public.ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater_user_id ON public.ratings(rater_user_id);

-- Create a function to get average rating for a user
CREATE OR REPLACE FUNCTION get_user_average_rating(user_uuid uuid)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(AVG(rating::numeric), 0)
  FROM public.ratings 
  WHERE rated_user_id = user_uuid;
$$;

-- Create a function to get rating count for a user
CREATE OR REPLACE FUNCTION get_user_rating_count(user_uuid uuid)
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)
  FROM public.ratings 
  WHERE rated_user_id = user_uuid;
$$;
