-- Fix critical security issues in profiles table
-- First, update profiles RLS policies to secure sensitive data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure policy for viewing profiles
CREATE POLICY "Users can view limited profile info" ON public.profiles
  FOR SELECT
  USING (
    CASE 
      WHEN auth.uid() = id THEN true  -- Users can see their full profile
      WHEN auth.uid() IS NOT NULL THEN 
        -- Authenticated users can see limited public info only
        false -- We'll handle this through a separate public function
      ELSE false  -- Anonymous users cannot see profiles
    END
  );

-- Create a secure function to get public profile info
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  first_name text,
  last_name text,
  avatar text,
  joined_date timestamptz,
  rating numeric,
  total_swaps integer,
  achievements text[],
  is_verified boolean,
  region text,
  city text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar,
    p.joined_date,
    p.rating,
    p.total_swaps,
    p.achievements,
    p.is_verified,
    p.region,
    p.city
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Fix more database functions with proper search_path
CREATE OR REPLACE FUNCTION public.spend_coins(coin_amount integer, description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_coins INTEGER;
BEGIN
  -- Get current coin balance
  SELECT coins INTO current_coins FROM public.profiles WHERE id = auth.uid();
  
  -- Check if user has enough coins
  IF current_coins < coin_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct coins from profile
  UPDATE public.profiles 
  SET coins = coins - coin_amount 
  WHERE id = auth.uid();
  
  -- Record the transaction
  INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description)
  VALUES (auth.uid(), 'spend', -coin_amount, description);
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_coins(coin_amount integer, description text, payment_intent_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Add coins to profile
  UPDATE public.profiles 
  SET coins = coins + coin_amount 
  WHERE id = auth.uid();
  
  -- Record the transaction
  INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description, stripe_payment_intent_id)
  VALUES (auth.uid(), 'purchase', coin_amount, description, payment_intent_id);
END;
$function$;