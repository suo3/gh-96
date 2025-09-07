-- Update coin system and add promotion features

-- Create promoted_items table
CREATE TABLE public.promoted_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  user_id UUID NOT NULL,
  promotion_type TEXT NOT NULL DEFAULT 'featured', -- featured, category_featured, homepage_carousel
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  transaction_id UUID,
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create promotion_transactions table for mobile money payments
CREATE TABLE public.promotion_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  phone_number TEXT NOT NULL,
  provider TEXT NOT NULL, -- mtn, vodafone, airteltigo
  promotion_type TEXT NOT NULL,
  promotion_duration_days INTEGER NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  external_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create featured_sellers table
CREATE TABLE public.featured_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add promotion settings to platform_settings
INSERT INTO public.platform_settings (key, value) VALUES 
('promotion_featured_price', '10'),
('promotion_category_price', '5'), 
('promotion_carousel_price', '15'),
('promotion_default_duration', '7'),
('ghana_business_mtn', '0241234567'),
('ghana_business_vodafone', '0501234567'),
('ghana_business_airteltigo', '0271234567')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.promoted_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_sellers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promoted_items
CREATE POLICY "Anyone can view active promoted items" ON public.promoted_items
  FOR SELECT USING (status = 'active' AND ends_at > NOW());

CREATE POLICY "Users can create promotions for their items" ON public.promoted_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all promoted items" ON public.promoted_items
  FOR ALL USING (is_admin());

-- RLS Policies for promotion_transactions
CREATE POLICY "Users can view their own promotion transactions" ON public.promotion_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own promotion transactions" ON public.promotion_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all promotion transactions" ON public.promotion_transactions
  FOR SELECT USING (is_admin());

CREATE POLICY "System can update promotion transaction status" ON public.promotion_transactions
  FOR UPDATE USING (true);

-- RLS Policies for featured_sellers
CREATE POLICY "Anyone can view active featured sellers" ON public.featured_sellers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage featured sellers" ON public.featured_sellers
  FOR ALL USING (is_admin());

-- Create functions
CREATE OR REPLACE FUNCTION public.get_user_total_listings(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.listings 
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_promotion_price(promotion_type TEXT)
RETURNS NUMERIC
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN promotion_type = 'featured' THEN 
      COALESCE((SELECT (value::text)::numeric FROM platform_settings WHERE key = 'promotion_featured_price'), 10)
    WHEN promotion_type = 'category_featured' THEN 
      COALESCE((SELECT (value::text)::numeric FROM platform_settings WHERE key = 'promotion_category_price'), 5)
    WHEN promotion_type = 'homepage_carousel' THEN 
      COALESCE((SELECT (value::text)::numeric FROM platform_settings WHERE key = 'promotion_carousel_price'), 15)
    ELSE 10
  END;
$$;

-- Update the spend_coins function to no longer require coins for listings
CREATE OR REPLACE FUNCTION public.spend_coins(coin_amount INTEGER, description TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_coins INTEGER;
BEGIN
  -- For backward compatibility, but listings are now free
  IF description ILIKE '%listing%' THEN
    RETURN TRUE; -- Listings are now free
  END IF;
  
  -- Get current coin balance for other transactions
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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promoted_items_updated_at
  BEFORE UPDATE ON public.promoted_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotion_transactions_updated_at
  BEFORE UPDATE ON public.promotion_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_featured_sellers_updated_at
  BEFORE UPDATE ON public.featured_sellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();