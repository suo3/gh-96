
-- Add function to check if user can create listings based on max listings setting
CREATE OR REPLACE FUNCTION public.can_create_listing()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  max_allowed INTEGER;
  current_count INTEGER;
BEGIN
  -- Get max listings per user setting
  SELECT COALESCE((value::text)::integer, 10) 
  INTO max_allowed 
  FROM public.platform_settings 
  WHERE key = 'max_listings_per_user';
  
  -- Count current active listings for user
  SELECT COUNT(*) 
  INTO current_count 
  FROM public.listings 
  WHERE user_id = auth.uid() AND status = 'active';
  
  RETURN current_count < max_allowed;
END;
$$;

-- Add function to check if anonymous browsing is allowed
CREATE OR REPLACE FUNCTION public.is_anonymous_allowed()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT (value::text)::boolean 
    FROM public.platform_settings 
    WHERE key = 'allow_anonymous'
  ), false);
$$;

-- Add function to check if listing approval is required
CREATE OR REPLACE FUNCTION public.requires_approval()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE((
    SELECT (value::text)::boolean 
    FROM public.platform_settings 
    WHERE key = 'require_approval'
  ), false);
$$;

-- Update listings table RLS policy to check anonymous browsing
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Users can view all listings" ON public.listings;

CREATE POLICY "Allow listing access based on settings" 
  ON public.listings 
  FOR SELECT 
  USING (
    status = 'active'::text AND (
      is_anonymous_allowed() = true OR 
      auth.uid() IS NOT NULL
    )
  );

-- Update listings insert policy to check max listings
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;

CREATE POLICY "Users can create listings within limits" 
  ON public.listings 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    can_create_listing()
  );

-- Add trigger to set listing status based on approval requirement
CREATE OR REPLACE FUNCTION public.set_listing_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set status based on approval requirement
  IF requires_approval() THEN
    NEW.status = 'pending';
  ELSE
    NEW.status = COALESCE(NEW.status, 'active');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new listings
DROP TRIGGER IF EXISTS set_listing_status_trigger ON public.listings;
CREATE TRIGGER set_listing_status_trigger
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_listing_status();
