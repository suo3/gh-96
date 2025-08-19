-- Create coin pricing table for pricing plans
CREATE TABLE public.coin_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id text NOT NULL UNIQUE,
  name text NOT NULL,
  coins integer NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  savings text,
  features text[] NOT NULL DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coin_pricing ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing coin pricing (everyone can see)
CREATE POLICY "Anyone can view coin pricing" 
ON public.coin_pricing 
FOR SELECT 
USING (is_active = true);

-- Create policy for admins to manage pricing
CREATE POLICY "Only admins can manage coin pricing" 
ON public.coin_pricing 
FOR ALL
USING (is_admin());

-- Insert Ghana-specific pricing plans
INSERT INTO public.coin_pricing (plan_id, name, coins, price, currency, features, is_popular, display_order) VALUES
('starter', 'Starter Pack', 25, 20.00, 'GHS', ARRAY['25 listing posts', '12 swap opportunities'], false, 1),
('value', 'Value Pack', 60, 40.00, 'GHS', ARRAY['60 listing posts', '30 swap opportunities'], true, 2),
('power', 'Power Pack', 150, 80.00, 'GHS', ARRAY['150 listing posts', '75 swap opportunities'], false, 3);

-- Insert platform cost settings into platform_settings table
INSERT INTO public.platform_settings (key, value) VALUES
('listing_cost_coins', '1'),
('swap_cost_coins', '2'),
('default_starting_coins', '20')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create function to get platform cost settings
CREATE OR REPLACE FUNCTION public.get_listing_cost()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'listing_cost_coins'
  ), 1);
$$;

CREATE OR REPLACE FUNCTION public.get_swap_cost()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'swap_cost_coins'
  ), 2);
$$;

CREATE OR REPLACE FUNCTION public.get_default_starting_coins()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT (value::text)::integer 
    FROM public.platform_settings 
    WHERE key = 'default_starting_coins'
  ), 20);
$$;