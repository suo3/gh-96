-- Create user_favorites table for bookmarking items
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to check if item is favorited by user
CREATE OR REPLACE FUNCTION public.is_item_favorited(listing_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_favorites 
    WHERE listing_id = listing_uuid AND user_id = user_uuid
  );
$$;

-- Create function to get user's favorite items count
CREATE OR REPLACE FUNCTION public.get_user_favorites_count(user_uuid uuid DEFAULT auth.uid())
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)
  FROM public.user_favorites 
  WHERE user_id = user_uuid;
$$;