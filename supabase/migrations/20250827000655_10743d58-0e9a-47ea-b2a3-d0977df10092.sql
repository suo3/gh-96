-- Add RLS policy to allow admins to update any listing
CREATE POLICY "Admins can update any listing" 
ON public.listings 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

-- Add RLS policy to allow admins to delete any listing  
CREATE POLICY "Admins can delete any listing"
ON public.listings
FOR DELETE
USING (is_admin());