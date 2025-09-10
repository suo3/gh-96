-- Create sample Ghana marketplace listings with realistic data
-- These will show as listings without specific users until real users sign up

INSERT INTO listings (
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
),
-- Additional listings for variety
(
  'Gaming PC - RTX 4060, Ryzen 5',
  'Custom built gaming PC perfect for 1080p gaming. RTX 4060 graphics card, Ryzen 5 processor, 16GB RAM, 500GB SSD. Runs all modern games at high settings. Includes keyboard and mouse.',
  4500,
  'Electronics',
  'Used - Good',
  'Dansoman, Accra',
  ARRAY['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop'],
  ARRAY['Console', 'Laptop'],
  'active',
  32,
  6
),
(
  'Traditional Ashanti Stool',
  'Authentic hand-carved Ashanti stool made from solid wood. Beautiful traditional designs and excellent craftsmanship. Perfect for home decoration or cultural events. This is a piece of Ghanaian heritage.',
  350,
  'Antiques',
  'New',
  'Ejisu, Kumasi',
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
  ARRAY['Other antiques', 'Traditional items'],
  'active',
  18,
  3
),
(
  'Fresh Palm Oil - 5 Liters',
  'Pure, fresh palm oil directly from our plantation. No preservatives or additives. Perfect for cooking traditional Ghanaian dishes. Rich in vitamin E and natural antioxidants.',
  80,
  'Food',
  'New',
  'Sekondi-Takoradi',
  ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop'],
  ARRAY['Other cooking oils', 'Foodstuff'],
  'active',
  15,
  2
),
(
  'Soccer Cleats - Nike Mercurial Size 42',
  'Nike Mercurial soccer cleats in excellent condition. Size 42 (EU). Perfect for playing on grass fields. Used only a few times. Great grip and comfort for serious players.',
  180,
  'Sports',
  'Used - Like New',
  'Osu, Accra',
  ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
  ARRAY['Other sports shoes', 'Football gear'],
  'active',
  25,
  4
);