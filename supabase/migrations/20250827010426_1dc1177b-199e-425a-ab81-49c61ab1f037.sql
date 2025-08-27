-- Rename swaps table to sales
ALTER TABLE public.swaps RENAME TO sales;

-- Rename swap-related columns in profiles table
ALTER TABLE public.profiles RENAME COLUMN total_swaps TO total_sales;
ALTER TABLE public.profiles RENAME COLUMN monthly_swaps TO monthly_sales;

-- Update any platform settings that reference swaps
UPDATE public.platform_settings 
SET key = 'sale_cost_coins' 
WHERE key = 'swap_cost_coins';

-- Create or replace functions that were using swap terminology
CREATE OR REPLACE FUNCTION public.get_sale_cost()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'sale_cost_coins'
  ), 2);
$function$;