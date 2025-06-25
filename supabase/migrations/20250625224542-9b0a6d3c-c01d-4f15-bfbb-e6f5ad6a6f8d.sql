
-- Create an enum for admin roles
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'moderator', 'support');

-- Create admin_users table to track admin permissions
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role admin_role NOT NULL DEFAULT 'support',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check admin roles
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
$$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid UUID DEFAULT auth.uid())
RETURNS admin_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.admin_users 
  WHERE user_id = user_uuid 
  AND is_active = true
  LIMIT 1;
$$;

-- RLS policies for admin_users table
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Super admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (public.get_admin_role() = 'super_admin');

-- Add reported_listings table for content moderation
CREATE TABLE public.reported_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on reported_listings
ALTER TABLE public.reported_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for reported_listings
CREATE POLICY "Users can report listings" 
  ON public.reported_listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view reports" 
  ON public.reported_listings 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Moderators can update reports" 
  ON public.reported_listings 
  FOR UPDATE 
  USING (public.is_admin());
