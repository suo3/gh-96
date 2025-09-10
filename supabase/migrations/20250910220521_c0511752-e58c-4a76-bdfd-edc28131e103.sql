-- Add promotion feature settings to platform_settings table
INSERT INTO platform_settings (key, value, created_at, updated_at) VALUES 
('enable_promotions', 'true', now(), now()),
('enable_manual_featuring', 'true', now(), now()),
('enable_category_featuring', 'true', now(), now()),
('enable_homepage_carousel', 'true', now(), now())
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();