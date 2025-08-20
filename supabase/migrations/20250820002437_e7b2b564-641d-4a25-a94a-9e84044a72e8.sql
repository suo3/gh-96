-- Drop existing duplicate UPDATE policies for listings
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;

-- Create a single, clear UPDATE policy for listings
CREATE POLICY "Users can update their own listings" ON public.listings
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Also drop duplicate DELETE policies and recreate a single one
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

-- Create a single, clear DELETE policy for listings
CREATE POLICY "Users can delete their own listings" ON public.listings
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);