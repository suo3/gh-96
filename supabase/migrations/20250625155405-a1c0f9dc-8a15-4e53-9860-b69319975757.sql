
-- Add coins field to profiles table and remove membership functionality
ALTER TABLE public.profiles 
ADD COLUMN coins INTEGER NOT NULL DEFAULT 20;

-- Remove the membership_type field since we're moving to coin system
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS membership_type;

-- Create a table to track coin transactions (purchases and usage)
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  amount INTEGER NOT NULL, -- positive for purchases/refunds, negative for spending
  description TEXT,
  stripe_payment_intent_id TEXT, -- for purchase transactions
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for coin transactions
CREATE POLICY "Users can view their own coin transactions" 
  ON public.coin_transactions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own coin transactions" 
  ON public.coin_transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Update the handle_new_user function to set initial coins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name, avatar, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar', upper(left(COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.email), 1))),
    20 -- Start with 20 free coins
  );
  RETURN NEW;
END;
$$;

-- Create function to check if user has enough coins for an action
CREATE OR REPLACE FUNCTION public.check_user_coins(required_coins INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((SELECT coins FROM public.profiles WHERE id = auth.uid()), 0) >= required_coins;
$$;

-- Create function to spend coins (will be used when posting listings or making swaps)
CREATE OR REPLACE FUNCTION public.spend_coins(coin_amount INTEGER, description TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to add coins (will be used after successful purchases)
CREATE OR REPLACE FUNCTION public.add_coins(coin_amount INTEGER, description TEXT, payment_intent_id TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add coins to profile
  UPDATE public.profiles 
  SET coins = coins + coin_amount 
  WHERE id = auth.uid();
  
  -- Record the transaction
  INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description, stripe_payment_intent_id)
  VALUES (auth.uid(), 'purchase', coin_amount, description, payment_intent_id);
END;
$$;
