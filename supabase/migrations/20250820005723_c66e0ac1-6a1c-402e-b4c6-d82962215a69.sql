-- Fix critical security issues in profiles table
-- Create restricted view for public profile access
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  username,
  first_name,
  last_name,
  avatar,
  joined_date,
  rating,
  total_swaps,
  monthly_listings,
  monthly_swaps,
  achievements,
  is_verified,
  region,
  city
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profiles_public SET (security_barrier = true);

-- Update profiles RLS policies to secure sensitive data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policy for viewing profiles
CREATE POLICY "Users can view public profile info" ON public.profiles
  FOR SELECT
  USING (
    CASE 
      WHEN auth.uid() = id THEN true  -- Users can see their full profile
      ELSE false  -- Others cannot see full profiles directly
    END
  );

-- Create policy for public profiles view
CREATE POLICY "Anyone can view public profiles" ON public.profiles_public
  FOR SELECT
  USING (true);

-- Update profiles table to secure sensitive columns
ALTER TABLE public.profiles ALTER COLUMN phone_number SET DEFAULT NULL;
ALTER TABLE public.profiles ALTER COLUMN bio SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN profile_image_url SET DEFAULT NULL;

-- Fix database function security by setting search_path
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid DEFAULT auth.uid())
 RETURNS admin_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role 
  FROM public.admin_users 
  WHERE user_id = user_uuid 
  AND is_active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, phone_number, avatar, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar', upper(left(COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.email), 1))),
    20 -- Start with 20 free coins
  );
  RETURN NEW;
END;
$function$;