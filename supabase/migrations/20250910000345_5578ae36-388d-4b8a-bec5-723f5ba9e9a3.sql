-- Add platform settings for promotion pricing
INSERT INTO public.platform_settings (key, value) VALUES 
  ('promotion_featured_price', '10'),
  ('promotion_category_price', '7'),
  ('promotion_carousel_price', '15'),
  ('promotion_default_duration', '7')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add business accounts for mobile money providers
INSERT INTO public.platform_settings (key, value) VALUES 
  ('ghana_business_mtn', '0241234567'),
  ('ghana_business_vodafone', '0503456789'),
  ('ghana_business_airteltigo', '0567890123')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;