-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

-- Create the get_public_profile function with correct return structure
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar text,
  bio text,
  rating numeric,
  total_sales integer,
  region text,
  city text,
  joined_date timestamp with time zone,
  is_verified boolean,
  achievements text[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar,
    p.bio,
    p.rating,
    p.total_sales,
    p.region,
    p.city,
    p.joined_date,
    p.is_verified,
    p.achievements
  FROM public.profiles p
  WHERE p.id = profile_id;
$function$;