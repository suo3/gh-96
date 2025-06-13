
-- Remove the foreign key constraint
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

-- Make user_id nullable
ALTER TABLE public.listings ALTER COLUMN user_id DROP NOT NULL;

-- Temporarily disable RLS to insert sample data
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

-- Insert sample listings data
INSERT INTO public.listings (title, description, category, condition, location, wanted_items, images, user_id) VALUES
(
  'Vintage Guitar',
  'Beautiful vintage acoustic guitar in excellent condition. Perfect for musicians looking for that classic sound.',
  'Musical Instruments',
  'Excellent',
  'Seattle, WA',
  ARRAY['Piano', 'Violin', 'Music Equipment'],
  ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'],
  gen_random_uuid()
),
(
  'MacBook Pro 2021',
  'Barely used MacBook Pro with M1 chip. Great for students or professionals.',
  'Electronics',
  'Like New',
  'Portland, OR',
  ARRAY['iPad', 'Desktop Computer', 'Camera'],
  ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop'],
  gen_random_uuid()
),
(
  'Designer Handbag',
  'Authentic designer handbag, rarely used. Perfect condition with original tags.',
  'Fashion',
  'Like New',
  'San Francisco, CA',
  ARRAY['Jewelry', 'Shoes', 'Accessories'],
  ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'],
  gen_random_uuid()
),
(
  'Road Bike',
  'High-quality road bike, perfect for commuting and weekend rides.',
  'Sports',
  'Good',
  'Austin, TX',
  ARRAY['Mountain Bike', 'Cycling Gear', 'Fitness Equipment'],
  ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
  gen_random_uuid()
),
(
  'Coffee Table Books',
  'Collection of beautiful coffee table books on art and photography.',
  'Books',
  'Good',
  'Denver, CO',
  ARRAY['Art Supplies', 'Photography Equipment', 'Books'],
  ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'],
  gen_random_uuid()
);

-- Re-enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Update RLS policy to allow viewing all listings
DROP POLICY IF EXISTS "Users can view all listings" ON public.listings;
CREATE POLICY "Users can view all listings" ON public.listings FOR SELECT USING (true);
