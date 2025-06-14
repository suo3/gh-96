
-- Drop existing foreign key constraints on ratings table
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rated_user_id_fkey;
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rater_user_id_fkey;

-- Add foreign key constraints to reference profiles table instead
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_rated_user_id_fkey 
FOREIGN KEY (rated_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_rater_user_id_fkey 
FOREIGN KEY (rater_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
