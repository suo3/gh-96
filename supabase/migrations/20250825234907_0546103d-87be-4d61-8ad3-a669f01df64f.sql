-- Update the profiles RLS policy to allow public access to basic profile info including location data
-- This is needed for distance-based filtering to work properly

DROP POLICY IF EXISTS "Users can view limited profile info" ON public.profiles;

-- Create new policy that allows public access to essential profile data
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Update the existing user update policy name for consistency
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update the existing user insert policy name for consistency  
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);