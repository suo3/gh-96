-- Create sample Ghana marketplace data
-- First, create some sample user profiles for realistic marketplace data

-- Insert sample users for the marketplace
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  username,
  location,
  region,
  city,
  bio,
  rating,
  total_sales,
  coins,
  achievements,
  is_verified,
  phone_number,
  preferred_contact_method
) VALUES
-- Tech seller from Accra
(
  '11111111-1111-1111-1111-111111111111',
  'Kwame',
  'Asante',
  'kwame_tech',
  'East Legon, Accra',
  'Greater Accra',
  'Accra',
  'Tech enthusiast with 5+ years experience in electronics. I sell only genuine, tested devices with warranty. WhatsApp me for quick response!',
  4.8,
  23,
  150,
  ARRAY['verified_seller', 'top_rated'],
  true,
  '+233244123456',
  'whatsapp'
),
-- Fashion seller from Kumasi  
(
  '22222222-2222-2222-2222-222222222222',
  'Ama',
  'Osei',
  'ama_fashion',
  'Adum, Kumasi',
  'Ashanti',
  'Kumasi',
  'Your go-to person for authentic Kente cloth and modern African fashion. All items are handpicked and quality assured. Free delivery within Kumasi!',
  4.9,
  45,
  200,
  ARRAY['fashion_expert', 'top_rated', 'fast_shipper'],
  true,
  '+233554789012',
  'whatsapp'
),
-- Car dealer from Tema
(
  '33333333-3333-3333-3333-333333333333',
  'Kofi',
  'Mensah',
  'kofi_cars',
  'Community 2, Tema',
  'Greater Accra',
  'Tema',
  'Reliable car dealer with 10+ years experience. All vehicles come with full inspection report and 3-month warranty. Financing available!',
  4.7,
  12,
  120,
  ARRAY['auto_expert', 'warranty_provider'],
  true,
  '+233201234567',
  'phone'
),
-- Home & Garden seller
(
  '44444444-4444-4444-4444-444444444444',
  'Akosua',
  'Adjei',
  'akosua_home',
  'Spintex, Accra',
  'Greater Accra', 
  'Accra',
  'Quality home appliances and garden supplies. New and gently used items. Same day delivery available in Accra.',
  4.6,
  18,
  80,
  ARRAY['home_specialist'],
  false,
  '+233244567890',
  'whatsapp'
),
-- Electronics specialist
(
  '55555555-5555-5555-5555-555555555555',
  'Yaw',
  'Boateng',
  'yaw_electronics',
  'Madina, Accra',
  'Greater Accra',
  'Accra',
  'Computer repairs and sales specialist. Laptops, phones, accessories. All items tested before sale. 1-year warranty on repairs.',
  4.5,
  31,
  95,
  ARRAY['tech_repair', 'warranty_provider'],
  false,
  '+233244890123',
  'whatsapp'
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  username = EXCLUDED.username,
  location = EXCLUDED.location,
  region = EXCLUDED.region,
  city = EXCLUDED.city,
  bio = EXCLUDED.bio,
  rating = EXCLUDED.rating,
  total_sales = EXCLUDED.total_sales,
  coins = EXCLUDED.coins,
  achievements = EXCLUDED.achievements,
  is_verified = EXCLUDED.is_verified,
  phone_number = EXCLUDED.phone_number,
  preferred_contact_method = EXCLUDED.preferred_contact_method;

-- Insert sample listings for Ghana marketplace
INSERT INTO listings (
  id,
  user_id,
  title,
  description,
  price,
  category,
  condition,
  location,
  images,
  wanted_items,
  status,
  views,
  likes
) VALUES
-- Electronics listings
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'iPhone 14 Pro Max 256GB - Deep Purple',
  'Barely used iPhone 14 Pro Max in excellent condition. Used for only 3 months. All original accessories included: charger, cable, box, and unused EarPods. Screen protector applied since day one. Battery health at 98%. Serious buyers only. Can meet in East Legon or Accra Mall.',
  8500,
  'Electronics',
  'Used - Like New',
  'East Legon, Accra',
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'],
  ARRAY['Samsung Galaxy S24 Ultra', 'Cash'],
  'active',
  45,
  8
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'MacBook Air M2 13" 8GB/256GB Silver',
  'Brand new MacBook Air M2 chip (2022 model). Perfect for students and professionals. Includes original packaging, charger, and documentation. Warranty valid until 2025. Ideal for programming, design work, and everyday computing.',
  12000,
  'Electronics',
  'New',
  'Madina, Accra',
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'],
  ARRAY['ThinkPad X1', 'Cash', 'MacBook Pro'],
  'active',
  67,
  12
),
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Samsung 65" QLED 4K Smart TV',
  'Excellent condition Samsung QLED TV. Bought 1 year ago, barely used. Crystal clear 4K display with HDR. Smart TV features work perfectly. Includes remote, power cord, and original stand. Perfect for living room or bedroom.',
  3200,
  'Electronics',
  'Used - Good',
  'East Legon, Accra',
  ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'],
  ARRAY['LG OLED', 'Cash', 'Sony Bravia'],
  'active',
  23,
  5
),

-- Vehicles
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'Toyota Corolla 2019 - Automatic',
  'Well maintained Toyota Corolla 2019 model. Low mileage (45,000km), full service history available. AC works perfectly, all electrical components functional. Recently serviced with new tires. Clean interior and exterior. Serious buyers welcome for inspection.',
  75000,
  'Cars',
  'Used - Good',
  'Community 2, Tema',
  ARRAY['https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop'],
  ARRAY['Honda Civic', 'Nissan Sentra', 'Camry'],
  'active',
  89,
  15
),
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'Honda Accord 2020 - Executive Edition',
  'Premium Honda Accord in excellent condition. Leather seats, sunroof, navigation system. Only 28,000km mileage. Single owner, garage kept. Full maintenance records. This car drives like new and is perfect for executives.',
  95000,
  'Cars',
  'Used - Like New',
  'Community 2, Tema',
  ARRAY['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop'],
  ARRAY['Camry', 'Altima', 'Cash'],
  'active',
  56,
  9
),

-- Fashion
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'Authentic Bonwire Kente Cloth - Royal Blue',
  'Gorgeous authentic handwoven Kente cloth from Bonwire village. Traditional Ashanti patterns in royal blue and gold. Perfect for weddings, graduations, and special occasions. High quality cotton threads. This is a collectors piece that will last generations.',
  800,
  'Fashion',
  'New',
  'Adum, Kumasi',
  ARRAY['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop'],
  ARRAY['Other traditional wear', 'African prints'],
  'active',
  34,
  11
),
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'African Print Dress - Size 12',
  'Beautiful African print dress, size 12. Modern cut with traditional patterns. Worn only twice, excellent condition. Perfect for office or casual wear. High quality Vlisco fabric. Dry cleaned and ready to wear.',
  120,
  'Fashion',
  'Used - Like New',
  'Adum, Kumasi',
  ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400&h=300&fit=crop'],
  ARRAY['Other dresses', 'Jewelry'],
  'active',
  28,
  6
),

-- Home & Garden
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'Panasonic Rice Cooker 5L - Family Size',
  'Brand new Panasonic rice cooker, 5 liter capacity perfect for families. Energy efficient with automatic keep-warm function. Includes steaming tray for vegetables. Still in original packaging with 2-year warranty. Cook perfect rice every time!',
  250,
  'Home & Garden',
  'New',
  'Spintex, Accra',
  ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'],
  ARRAY['Blender', 'Microwave', 'Kitchen appliances'],
  'active',
  19,
  4
),
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'Royal Foam Mattress - Queen Size',
  'Royal Foam orthopedic mattress, queen size (6x6 feet). Used for only 6 months, excellent condition. Very comfortable and supportive. Comes with waterproof protector. Perfect for couples or anyone wanting luxury sleep.',
  800,
  'Home & Garden',
  'Used - Like New',
  'Spintex, Accra',
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
  ARRAY['King size mattress', 'Bedroom furniture'],
  'active',
  41,
  7
),

-- Real Estate
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'Modern 3 Bedroom House - Kumasi',
  'Beautiful modern 3 bedroom house in a quiet residential area. 2 bathrooms, spacious kitchen, living room, and dining area. Tiled floors throughout, ceiling fans in all rooms. Walled compound with parking space for 2 cars. Ready for immediate occupation.',
  450000,
  'Real Estate',
  'New',
  'Adum, Kumasi',
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'],
  ARRAY['Land', '4 Bedroom House', 'Apartment building'],
  'active',
  125,
  22
),

-- Services
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'Computer & Phone Repair Services',
  'Professional computer and phone repair services. Screen replacement, software issues, virus removal, data recovery. Over 10 years experience. Quick turnaround time, warranty on all repairs. Free diagnostics for major repairs.',
  50,
  'Services',
  'N/A',
  'Madina, Accra',
  ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop'],
  ARRAY['Broken phones', 'Laptop repairs'],
  'active',
  78,
  13
);

-- Create some conversation history for realism
INSERT INTO conversations (id, user1_id, user2_id, listing_id, item_title) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', (SELECT id FROM listings WHERE title LIKE 'iPhone 14 Pro Max%' LIMIT 1), 'iPhone 14 Pro Max 256GB - Deep Purple'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', (SELECT id FROM listings WHERE title LIKE 'Authentic Bonwire Kente%' LIMIT 1), 'Authentic Bonwire Kente Cloth - Royal Blue');

-- Add some sample messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
((SELECT id FROM conversations LIMIT 1), '44444444-4444-4444-4444-444444444444', 'Hi, is the iPhone still available?'),
((SELECT id FROM conversations LIMIT 1), '11111111-1111-1111-1111-111111111111', 'Yes, it is! Are you interested in seeing it?'),
((SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1), '33333333-3333-3333-3333-333333333333', 'Beautiful Kente! Can you do 750?'),
((SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1), '22222222-2222-2222-2222-222222222222', 'This is authentic Bonwire quality. Lowest I can go is 780.');

-- Add some sample ratings
INSERT INTO ratings (rated_user_id, rater_user_id, rating, comment, item_title) VALUES
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 5, 'Excellent seller! Phone exactly as described, great communication.', 'iPhone 14 Pro Max'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 5, 'Amazing quality Kente cloth! Fast delivery and great packaging.', 'Bonwire Kente Cloth'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 4, 'Honest car dealer, very professional transaction.', 'Toyota Corolla'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 5, 'Great appliances, exactly as advertised!', 'Rice Cooker'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 4, 'Fixed my laptop quickly and professionally.', 'Computer Repair');