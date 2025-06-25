
-- Create function to increment listing views
CREATE OR REPLACE FUNCTION public.increment_listing_views(listing_uuid uuid)
RETURNS void
LANGUAGE sql
AS $function$
  UPDATE public.listings 
  SET views = COALESCE(views, 0) + 1,
      updated_at = now()
  WHERE id = listing_uuid;
$function$;

-- Create function to increment listing likes
CREATE OR REPLACE FUNCTION public.increment_listing_likes(listing_uuid uuid)
RETURNS void
LANGUAGE sql
AS $function$
  UPDATE public.listings 
  SET likes = COALESCE(likes, 0) + 1,
      updated_at = now()
  WHERE id = listing_uuid;
$function$;
