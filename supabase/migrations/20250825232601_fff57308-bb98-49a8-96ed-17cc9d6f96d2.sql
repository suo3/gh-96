-- Fix function search paths for security
-- These functions need to have search_path set for security compliance

CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid DEFAULT auth.uid())
 RETURNS admin_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
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
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_anonymous_allowed()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::boolean 
    FROM public.platform_settings 
    WHERE key = 'allow_anonymous'
  ), false);
$function$;

CREATE OR REPLACE FUNCTION public.requires_approval()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::boolean 
    FROM public.platform_settings 
    WHERE key = 'require_approval'
  ), false);
$function$;

CREATE OR REPLACE FUNCTION public.get_listing_cost()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'listing_cost_coins'
  ), 1);
$function$;

CREATE OR REPLACE FUNCTION public.get_swap_cost()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'swap_cost_coins'
  ), 2);
$function$;

CREATE OR REPLACE FUNCTION public.get_default_starting_coins()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'default_starting_coins'
  ), 20);
$function$;