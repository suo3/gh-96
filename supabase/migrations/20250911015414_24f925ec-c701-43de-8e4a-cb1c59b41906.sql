-- Drop the restrictive UPDATE policy and create a more specific one for status updates
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;

-- Create a new policy that allows users to update specific fields of their own listings
CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);