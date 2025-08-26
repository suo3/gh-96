-- Add foreign key constraint between listings and profiles
ALTER TABLE public.listings 
ADD CONSTRAINT listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;