
-- Create a settings table to store platform-wide configuration
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage settings
CREATE POLICY "Only admins can manage platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (public.is_admin());

-- Create policy that allows everyone to read settings (for public announcements)
CREATE POLICY "Everyone can read platform settings" 
  ON public.platform_settings 
  FOR SELECT 
  USING (true);

-- Insert default settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('max_listings_per_user', '10'),
  ('require_approval', 'false'),
  ('allow_anonymous', 'false'),
  ('welcome_message', '"Welcome to SwapBoard!"'),
  ('announcement_text', '""');
