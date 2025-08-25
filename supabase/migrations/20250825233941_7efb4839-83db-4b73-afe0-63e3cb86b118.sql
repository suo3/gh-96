-- Fix the remaining functions with search path issues

CREATE OR REPLACE FUNCTION public.spend_coins(coin_amount integer, description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.can_create_listing()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
BEGIN
  -- Get max listings per user setting
  SELECT COALESCE((value::text)::integer, 10) 
  INTO max_allowed 
  FROM public.platform_settings 
  WHERE key = 'max_listings_per_user';
  
  -- Count current active listings for user
  SELECT COUNT(*) 
  INTO current_count 
  FROM public.listings 
  WHERE user_id = auth.uid() AND status = 'active';
  
  RETURN current_count < max_allowed;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_listing_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Set status based on approval requirement
  IF requires_approval() THEN
    NEW.status = 'pending';
  ELSE
    NEW.status = COALESCE(NEW.status, 'active');
  END IF;
  
  RETURN NEW;
END;
$function$;