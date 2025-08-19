-- Add Ghana-specific fields to profiles table for better market support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS social_media_handles jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_documents text[],
ADD COLUMN IF NOT EXISTS preferred_contact_method text DEFAULT 'whatsapp';

-- Add index for location-based searches
CREATE INDEX IF NOT EXISTS idx_profiles_region_city ON public.profiles(region, city);
CREATE INDEX IF NOT EXISTS idx_profiles_location_search ON public.profiles USING gin(to_tsvector('english', location));

-- Add some Ghana-specific regions and cities for better location support
CREATE TABLE IF NOT EXISTS public.ghana_regions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  cities text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Insert Ghana regions and major cities
INSERT INTO public.ghana_regions (name, cities) VALUES
('Greater Accra', ARRAY['Accra', 'Tema', 'Kasoa', 'Madina', 'Adenta', 'Dansoman', 'Nungua', 'Teshie'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Ashanti', ARRAY['Kumasi', 'Obuasi', 'Ejisu', 'Konongo', 'Agogo', 'Bekwai', 'Mampong'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Western', ARRAY['Sekondi-Takoradi', 'Tarkwa', 'Axim', 'Elubo', 'Prestea', 'Bogoso'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Eastern', ARRAY['Koforidua', 'Akropong', 'Suhum', 'Akim Oda', 'Kyebi', 'Nkawkaw'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Northern', ARRAY['Tamale', 'Yendi', 'Savelugu', 'Tolon', 'Kumbungu'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Central', ARRAY['Cape Coast', 'Winneba', 'Kasoa', 'Elmina', 'Saltpond'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Volta', ARRAY['Ho', 'Keta', 'Kpando', 'Hohoe', 'Aflao'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Upper East', ARRAY['Bolgatanga', 'Navrongo', 'Bawku', 'Paga'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Upper West', ARRAY['Wa', 'Lawra', 'Jirapa', 'Tumu'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

INSERT INTO public.ghana_regions (name, cities) VALUES
('Brong Ahafo', ARRAY['Sunyani', 'Techiman', 'Berekum', 'Dormaa Ahenkro'])
ON CONFLICT (name) DO UPDATE SET cities = EXCLUDED.cities;

-- Enable RLS on the new table
ALTER TABLE public.ghana_regions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the regions data
CREATE POLICY "Anyone can view Ghana regions" ON public.ghana_regions
FOR SELECT USING (true);