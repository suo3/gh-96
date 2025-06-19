
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conditions table  
CREATE TABLE public.conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow everyone to read these tables (they're configuration data)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view conditions" 
  ON public.conditions 
  FOR SELECT 
  USING (true);

-- Insert all categories (original + expanded)
INSERT INTO public.categories (name, display_order) VALUES
  ('Electronics', 1),
  ('Clothing', 2),
  ('Books', 3),
  ('Home & Garden', 4),
  ('Sports', 5),
  ('Music', 6),
  ('Vehicles', 7),
  ('Furniture', 8),
  ('Other', 9),
  ('Toys & Games', 10),
  ('Baby & Kids', 11),
  ('Beauty & Health', 12),
  ('Kitchen & Dining', 13),
  ('Tools & Hardware', 14),
  ('Automotive', 15),
  ('Pet Supplies', 16),
  ('Art & Crafts', 17),
  ('Collectibles', 18),
  ('Office Supplies', 19),
  ('Garden & Outdoor', 20),
  ('Fitness Equipment', 21),
  ('Musical Instruments', 22),
  ('Video Games', 23),
  ('Movies & TV', 24),
  ('Jewelry & Accessories', 25),
  ('Bags & Luggage', 26),
  ('Shoes', 27),
  ('Appliances', 28),
  ('Vintage & Antiques', 29);

-- Insert default conditions
INSERT INTO public.conditions (name, value, display_order) VALUES
  ('New', 'new', 1),
  ('Like New', 'like_new', 2),
  ('Used - Good', 'used_good', 3),
  ('Used - Fair', 'used_fair', 4);
