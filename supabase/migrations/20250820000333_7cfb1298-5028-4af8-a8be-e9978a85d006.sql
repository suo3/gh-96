-- Add platform settings for achievement thresholds and app configuration
INSERT INTO public.platform_settings (key, value, created_at, updated_at) VALUES 
  ('achievement_first_swap_count', '1', now(), now()),
  ('achievement_swap_master_count', '10', now(), now()),
  ('achievement_high_rating_threshold', '4.5', now(), now()),
  ('achievement_community_favorite_count', '50', now(), now()),
  ('achievement_speed_swapper_count', '5', now(), now()),
  ('achievement_speed_swapper_days', '7', now(), now()),
  ('achievement_trusted_trader_count', '20', now(), now()),
  ('max_distance', '25', now(), now()),
  ('default_price_range_min', '0', now(), now()),
  ('default_price_range_max', '1000', now(), now()),
  ('toast_remove_delay', '5000', now(), now())
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();