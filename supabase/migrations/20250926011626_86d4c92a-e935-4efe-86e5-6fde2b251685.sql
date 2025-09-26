-- Create distributor_profiles table for managing business distributors
CREATE TABLE public.distributor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  region TEXT,
  city TEXT,
  category TEXT NOT NULL,
  description TEXT,
  business_type TEXT,
  website TEXT,
  contact_person TEXT,
  contact_person_role TEXT,
  verification_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  source TEXT DEFAULT 'manual_import',
  notes TEXT,
  social_media_handles JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.distributor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active distributor profiles" 
ON public.distributor_profiles 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all distributor profiles" 
ON public.distributor_profiles 
FOR ALL 
USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_distributor_profiles_category ON public.distributor_profiles(category);
CREATE INDEX idx_distributor_profiles_region ON public.distributor_profiles(region);
CREATE INDEX idx_distributor_profiles_active ON public.distributor_profiles(is_active);
CREATE INDEX idx_distributor_profiles_verification ON public.distributor_profiles(verification_status);

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_distributor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_distributor_profiles_updated_at
  BEFORE UPDATE ON public.distributor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_distributor_profiles_updated_at();