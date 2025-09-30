import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface BulkProduct {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  images?: string[];
  wanted_items?: string[];
}

export const AdminBulkImport = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [products, setProducts] = useState<BulkProduct[]>([]);

  const sampleData = `title,description,price,category,condition,location,images,wanted_items
"iPhone 14 Pro Max 256GB","Barely used iPhone 14 Pro Max in excellent condition. All accessories included.",8500,"Electronics","Used - Like New","East Legon, Accra","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400","Samsung Galaxy S24, Cash"
"MacBook Air M2","2022 MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals.",12000,"Electronics","Used - Good","Kumasi","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400","ThinkPad, Cash"
"Samsung TV 55 Smart","55-inch Samsung Smart TV with 4K resolution. Perfect for home entertainment.",3500,"Electronics","Used - Good","Accra","https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400","LG TV, Sony TV"
"Gaming Laptop HP","High-performance gaming laptop with RTX graphics card. Perfect for gaming and work.",15000,"Electronics","Used - Like New","Tema","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400","Gaming Desktop, Cash"
"Sony Headphones","Wireless noise-cancelling headphones with excellent sound quality.",800,"Electronics","New","Kumasi","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400","Bose Headphones, Cash"
"Washer and Dryer Set","Energy-efficient washing machine and dryer combo. Perfect for families.",4500,"Appliances","Used - Good","Accra","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","Single Washer, Cash"
"Refrigerator Double Door","Large capacity double door refrigerator with freezer compartment.",3200,"Appliances","Used - Good","Tema","https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400","Single Door Fridge, Cash"
"Microwave Oven","Compact microwave oven with grill function. Perfect for small kitchens.",450,"Appliances","New","Kumasi","https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400","Toaster Oven, Cash"
"Air Conditioner Split","1.5 HP split AC unit with remote control. Energy efficient cooling.",2800,"Appliances","Used - Good","Accra","https://images.unsplash.com/photo-1506423555807-df39b04aceb8?w=400","Window AC, Cash"
"Blender High Speed","Professional grade blender for smoothies and food preparation.",320,"Appliances","New","Tema","https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400","Food Processor, Cash"
"Abstract Canvas Art","Beautiful abstract painting on canvas. Perfect for modern homes.",650,"Art & Crafts","New","Accra","https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400","Other Art, Cash"
"Handmade Pottery Set","Traditional Ghanaian pottery set including bowls and vases.",400,"Art & Crafts","New","Kumasi","https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400","Clay Items, Cash"
"Beaded Jewelry","Handcrafted beaded necklaces and bracelets. Traditional African designs.",150,"Art & Crafts","New","Tema","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Other Jewelry, Cash"
"Wood Carving Mask","Authentic African wooden mask. Hand-carved by local artisans.",800,"Art & Crafts","New","Accra","https://images.unsplash.com/photo-1577720643271-6760b6dc2054?w=400","Other Carvings, Cash"
"Kente Fabric Strips","Authentic Kente cloth strips for traditional wear or decoration.",500,"Art & Crafts","New","Kumasi","https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400","Traditional Cloth, Cash"
"Toyota Corolla 2019","Well maintained Toyota Corolla 2019 model. Low mileage, full service history.",45000,"Automotive","Used - Good","Tema","https://images.unsplash.com/photo-1549924231-f129b911e442?w=400","Honda Civic, Nissan Sentra"
"Honda Civic 2020","2020 Honda Civic in excellent condition. One owner, full service records.",52000,"Automotive","Used - Like New","Accra","https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400","Toyota Corolla, Cash"
"Nissan Sentra 2018","Reliable and fuel-efficient sedan. Perfect for daily commuting.",38000,"Automotive","Used - Good","Kumasi","https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400","Other Sedans, Cash"
"Ford Pickup Truck","Heavy-duty pickup truck perfect for construction and farming.",65000,"Automotive","Used - Good","Tema","https://images.unsplash.com/photo-1562141961-d1f1d5a8a76c?w=400","Other Trucks, Cash"
"Motorcycle Honda","150cc Honda motorcycle in good running condition. Great for city commuting.",8500,"Automotive","Used - Good","Accra","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400","Other Motorcycles, Cash"
"Baby Stroller","Lightweight and foldable baby stroller with safety harness.",450,"Baby & Kids","Used - Good","Accra","https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400","Baby Carrier, Cash"
"Children Bicycle","Kids bicycle with training wheels. Perfect for ages 4-8 years.",280,"Baby & Kids","Used - Good","Tema","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Scooter, Cash"
"Baby Crib Wooden","Solid wood baby crib with adjustable mattress height.",850,"Baby & Kids","Used - Like New","Kumasi","https://images.unsplash.com/photo-1555898019-aca9292ba016?w=400","Toddler Bed, Cash"
"Toy Building Blocks","Educational building blocks set for creative play.",150,"Baby & Kids","New","Accra","https://images.unsplash.com/photo-1558877385-bc7c71e40c23?w=400","Other Toys, Cash"
"High Chair Baby","Adjustable high chair for feeding time. Easy to clean.",320,"Baby & Kids","Used - Good","Tema","https://images.unsplash.com/photo-1586024408152-5b96006f2518?w=400","Booster Seat, Cash"
"Travel Backpack","Large capacity hiking backpack with multiple compartments.",380,"Bags & Luggage","Used - Good","Accra","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","Duffel Bag, Cash"
"Leather Handbag","Genuine leather handbag in brown. Perfect for office and casual use.",220,"Bags & Luggage","Used - Like New","Tema","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400","Shoulder Bag, Cash"
"Rolling Suitcase","Hard shell rolling suitcase with TSA lock. Perfect for travel.",450,"Bags & Luggage","Used - Good","Kumasi","https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400","Soft Suitcase, Cash"
"Laptop Bag","Padded laptop bag fits up to 15-inch laptops. Professional design.",180,"Bags & Luggage","New","Accra","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","Briefcase, Cash"
"School Backpack","Durable school backpack with multiple pockets. Perfect for students.",120,"Bags & Luggage","Used - Good","Tema","https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400","Canvas Bag, Cash"
"Face Cream Set","Anti-aging face cream set with moisturizer and serum.",180,"Beauty & Health","New","Accra","https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400","Other Skincare, Cash"
"Hair Extensions","Premium quality human hair extensions. Natural black color.",850,"Beauty & Health","New","Tema","https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400","Wigs, Cash"
"Perfume Collection","Set of 3 designer perfumes for women. Long-lasting fragrance.",320,"Beauty & Health","New","Kumasi","https://images.unsplash.com/photo-1541643600914-78b084683601?w=400","Single Perfume, Cash"
"Fitness Supplements","Protein powder and vitamin supplements for healthy living.",220,"Beauty & Health","New","Accra","https://images.unsplash.com/photo-1556228553-d2e44f6d794e?w=400","Other Supplements, Cash"
"Makeup Kit","Complete makeup kit with brushes and cosmetics.",450,"Beauty & Health","Used - Like New","Tema","https://images.unsplash.com/photo-1512207427035-c7a49e64bf75?w=400","Individual Items, Cash"
"Novel Collection","Set of 10 bestselling novels in excellent condition.",180,"Books","Used - Good","Accra","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400","Individual Books, Cash"
"Educational Textbooks","University level textbooks for engineering and science.",320,"Books","Used - Good","Tema","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400","Other Textbooks, Cash"
"Children Story Books","Collection of illustrated children's books. Perfect for young readers.",120,"Books","Used - Good","Kumasi","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400","Educational Books, Cash"
"Cooking Recipe Books","Professional cooking and baking recipe books.",150,"Books","Used - Like New","Accra","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400","Health Books, Cash"
"Business Books","Self-help and business development book collection.",220,"Books","Used - Good","Tema","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400","Other Business Books, Cash"
"Kente Cloth Traditional","Authentic handwoven Kente cloth from Bonwire. Perfect for special occasions.",800,"Clothing","New","Kumasi","https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400","Other traditional wear, Cash"
"Men Formal Suits","Complete formal suit set with jacket, pants and shirt.",450,"Clothing","Used - Like New","Accra","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400","Casual Wear, Cash"
"Women Dresses","Collection of elegant dresses for various occasions.",320,"Clothing","Used - Good","Tema","https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400","Casual Dresses, Cash"
"Jeans Collection","Designer jeans in various sizes and styles.",280,"Clothing","Used - Good","Kumasi","https://images.unsplash.com/photo-1542272454315-7ad9f0b82daa?w=400","Other Pants, Cash"
"T-Shirts Bundle","Pack of 5 quality cotton t-shirts in different colors.",150,"Clothing","Used - Good","Accra","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400","Polo Shirts, Cash"
"Vintage Vinyl Records","Collection of rare vinyl records from the 70s and 80s.",650,"Collectibles","Used - Good","Accra","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400","CDs, Cash"
"Antique Coins","Rare coin collection from different countries and eras.",850,"Collectibles","Used - Like New","Tema","https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400","Stamps, Cash"
"Comic Book Collection","Vintage comic books in protective sleeves.",320,"Collectibles","Used - Good","Kumasi","https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400","Magazines, Cash"
"Sports Memorabilia","Signed football jerseys and sports cards.",450,"Collectibles","Used - Like New","Accra","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400","Other Sports Items, Cash"
"Action Figures","Collection of superhero action figures in original packaging.",280,"Collectibles","New","Tema","https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400","Other Toys, Cash"
"Treadmill Electric","Electric treadmill with speed and incline controls. Perfect for home workouts.",3500,"Fitness Equipment","Used - Good","Accra","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400","Elliptical, Cash"
"Weight Set Dumbbells","Complete set of adjustable dumbbells with rack.",850,"Fitness Equipment","Used - Like New","Tema","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400","Barbell Set, Cash"
"Exercise Bike","Stationary exercise bike with digital display. Quiet operation.",1200,"Fitness Equipment","Used - Good","Kumasi","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Rowing Machine, Cash"
"Yoga Mats Set","Premium yoga mats with carrying straps. Non-slip surface.",180,"Fitness Equipment","New","Accra","https://images.unsplash.com/photo-1506629905607-45c0e8935e5f?w=400","Exercise Bands, Cash"
"Pull-up Bar","Doorway pull-up bar with multiple grip positions.",120,"Fitness Equipment","Used - Good","Tema","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400","Push-up Stands, Cash"
"Dining Table Set","6-seater wooden dining table with matching chairs.",2800,"Furniture","Used - Good","Accra","https://images.unsplash.com/photo-1549497538-303791108f95?w=400","4-Seater Set, Cash"
"Sofa Set 3+2","Comfortable leather sofa set with 3-seater and 2-seater.",4500,"Furniture","Used - Like New","Tema","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400","Single Sofa, Cash"
"Wardrobe 4-Door","Large wooden wardrobe with mirrors and drawers.",3200,"Furniture","Used - Good","Kumasi","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400","3-Door Wardrobe, Cash"
"Office Desk","Executive office desk with drawers and filing space.",850,"Furniture","Used - Good","Accra","https://images.unsplash.com/photo-1549497538-303791108f95?w=400","Computer Desk, Cash"
"Bed Frame King","Solid wood king size bed frame with headboard.",1500,"Furniture","Used - Like New","Tema","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400","Queen Bed, Cash"
"Garden Tools Set","Complete gardening tool set including spades, pruners, and watering can.",320,"Garden & Outdoor","Used - Good","Accra","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Individual Tools, Cash"
"Outdoor Furniture","Weather-resistant patio furniture set with table and 4 chairs.",2200,"Garden & Outdoor","Used - Good","Tema","https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400","Indoor Furniture, Cash"
"BBQ Grill","Large charcoal BBQ grill perfect for outdoor cooking.",650,"Garden & Outdoor","Used - Like New","Kumasi","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Gas Grill, Cash"
"Garden Hose","50-meter garden hose with spray nozzle attachment.",120,"Garden & Outdoor","New","Accra","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Sprinkler, Cash"
"Outdoor Umbrella","Large patio umbrella with UV protection.",450,"Garden & Outdoor","Used - Good","Tema","https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400","Gazebo, Cash"
"Rice Cooker - 5L","Brand new 5 liter rice cooker, perfect for families. Energy efficient.",150,"Home & Garden","New","Accra","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Blender, Microwave"
"Home Decor Set","Beautiful home decoration items including vases and photo frames.",280,"Home & Garden","New","Tema","https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400","Wall Art, Cash"
"Kitchen Utensils","Complete kitchen utensil set with knives, spatulas, and cutting boards.",220,"Home & Garden","Used - Good","Kumasi","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Cookware Set, Cash"
"Curtains Set","Elegant curtains for living room and bedroom windows.",180,"Home & Garden","Used - Like New","Accra","https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400","Blinds, Cash"
"Lighting Fixtures","Modern ceiling lights and table lamps for home lighting.",450,"Home & Garden","Used - Good","Tema","https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400","Floor Lamps, Cash"
"Gold Necklace","18k gold necklace with pendant. Perfect for special occasions.",2800,"Jewelry & Accessories","Used - Like New","Accra","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Silver Jewelry, Cash"
"Watch Collection","Premium watches including sports and dress styles.",1500,"Jewelry & Accessories","Used - Good","Tema","https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400","Single Watch, Cash"
"Diamond Earrings","Beautiful diamond stud earrings in white gold setting.",3500,"Jewelry & Accessories","Used - Like New","Kumasi","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Other Earrings, Cash"
"Sunglasses Designer","Designer sunglasses with UV protection. Various styles available.",320,"Jewelry & Accessories","Used - Good","Accra","https://images.unsplash.com/photo-1472635851025-f8eeef5bdc85?w=400","Regular Glasses, Cash"
"Bracelet Set","Collection of gold and silver bracelets for women.",850,"Jewelry & Accessories","Used - Like New","Tema","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Anklets, Cash"
"Cooking Pots Set","Stainless steel cooking pot set with different sizes.",380,"Kitchen & Dining","Used - Good","Accra","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Non-stick Pans, Cash"
"Dinner Plates Set","Complete dinner service for 8 people including plates, bowls, and cups.",320,"Kitchen & Dining","Used - Like New","Tema","https://images.unsplash.com/photo-1578749556568-bc2c40e68620?w=400","Glassware Set, Cash"
"Coffee Maker","Automatic drip coffee maker with programmable timer.",450,"Kitchen & Dining","Used - Good","Kumasi","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Espresso Machine, Cash"
"Kitchen Knives","Professional chef knife set with wooden block.",280,"Kitchen & Dining","Used - Like New","Accra","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Cutting Boards, Cash"
"Water Filter","Countertop water filtration system with replacement filters.",220,"Kitchen & Dining","New","Tema","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400","Water Pitcher, Cash"
"DVD Movie Collection","Collection of 50 popular movies on DVD.",320,"Movies & TV","Used - Good","Accra","https://images.unsplash.com/photo-1489599511504-b4637029cb46?w=400","Blu-ray Movies, Cash"
"TV Series Box Sets","Complete seasons of popular TV shows.",280,"Movies & TV","Used - Good","Tema","https://images.unsplash.com/photo-1489599511504-b4637029cb46?w=400","Individual DVDs, Cash"
"Home Theater System","5.1 surround sound system with subwoofer.",1800,"Movies & TV","Used - Like New","Kumasi","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400","Soundbar, Cash"
"Projector HD","HD projector perfect for home cinema setup.",2500,"Movies & TV","Used - Good","Accra","https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400","Screen, Cash"
"Streaming Device","4K streaming device with remote control.",180,"Movies & TV","Used - Like New","Tema","https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400","HDMI Cable, Cash"
"Guitar Acoustic","6-string acoustic guitar in excellent playing condition.",850,"Music","Used - Good","Accra","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400","Electric Guitar, Cash"
"Piano Keyboard","88-key digital piano with weighted keys.",2800,"Music","Used - Like New","Tema","https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400","Organ, Cash"
"Drum Set","Complete drum set with cymbals and hardware.",3200,"Music","Used - Good","Kumasi","https://images.unsplash.com/photo-1571327073757-af18f7b8c433?w=400","Electronic Drums, Cash"
"Vinyl Turntable","Professional DJ turntable with cartridge.",1200,"Music","Used - Like New","Accra","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400","Mixer, Cash"
"Microphone Set","Professional microphones for recording and live performance.",450,"Music","Used - Good","Tema","https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400","Audio Interface, Cash"
"Electric Piano","Portable electric piano with stand and bench.",1500,"Musical Instruments","Used - Good","Accra","https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400","Organ, Cash"
"Violin with Case","Full-size violin with bow and protective case.",650,"Musical Instruments","Used - Like New","Tema","https://images.unsplash.com/photo-1552422535-c45813c61732?w=400","Viola, Cash"
"Bass Guitar","4-string electric bass guitar with amplifier.",1200,"Musical Instruments","Used - Good","Kumasi","https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400","Guitar Amp, Cash"
"Saxophone Alto","Alto saxophone in gold brass finish with case.",2500,"Musical Instruments","Used - Like New","Accra","https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=400","Trumpet, Cash"
"Flute Silver","Concert flute in silver-plated finish.",850,"Musical Instruments","Used - Good","Tema","https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=400","Clarinet, Cash"
"Office Chair","Ergonomic office chair with lumbar support and adjustable height.",450,"Office Supplies","Used - Good","Accra","https://images.unsplash.com/photo-1549497538-303791108f95?w=400","Desk, Cash"
"Printer All-in-One","Multifunction printer with scan, copy, and wireless printing.",650,"Office Supplies","Used - Like New","Tema","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","Scanner, Cash"
"Filing Cabinet","4-drawer steel filing cabinet with lock.",380,"Office Supplies","Used - Good","Kumasi","https://images.unsplash.com/photo-1549497538-303791108f95?w=400","Bookshelf, Cash"
"Conference Table","Large conference table seats 8 people comfortably.",2800,"Office Supplies","Used - Good","Accra","https://images.unsplash.com/photo-1549497538-303791108f95?w=400","Meeting Chairs, Cash"
"Stationery Set","Complete office stationery including pens, paper, and folders.",120,"Office Supplies","New","Tema","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","Individual Items, Cash"
"Pet Carrier","Large pet carrier suitable for cats and small dogs.",180,"Pet Supplies","Used - Good","Accra","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Pet Bed, Cash"
"Dog Food Premium","High-quality dry dog food for adult dogs. 20kg bag.",150,"Pet Supplies","New","Tema","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400","Cat Food, Cash"
"Fish Tank Setup","Complete aquarium setup with filter, heater, and decorations.",850,"Pet Supplies","Used - Like New","Kumasi","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Fish Food, Cash"
"Pet Toys Set","Collection of toys for dogs and cats.",120,"Pet Supplies","Used - Good","Accra","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Pet Treats, Cash"
"Bird Cage Large","Spacious bird cage with perches and feeding bowls.",320,"Pet Supplies","Used - Good","Tema","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Bird Food, Cash"
"Running Shoes Nike","Nike running shoes in excellent condition. Size 42.",280,"Shoes","Used - Like New","Accra","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400","Other Sports Shoes, Cash"
"Formal Shoes Leather","Black leather formal shoes perfect for office wear.",320,"Shoes","Used - Good","Tema","https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400","Brown Shoes, Cash"
"Sneakers Collection","Various branded sneakers in different sizes and colors.",450,"Shoes","Used - Good","Kumasi","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400","Casual Shoes, Cash"
"High Heels Designer","Designer high heel shoes for special occasions.",380,"Shoes","Used - Like New","Accra","https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400","Flats, Cash"
"Boots Winter","Insulated winter boots suitable for cold weather.",220,"Shoes","Used - Good","Tema","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Rain Boots, Cash"
"Football Equipment","Complete football gear including cleats, shin guards, and jersey.",380,"Sports","Used - Good","Accra","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400","Basketball Gear, Cash"
"Tennis Racket","Professional tennis racket with grip and cover.",220,"Sports","Used - Like New","Tema","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400","Badminton Racket, Cash"
"Golf Club Set","Complete golf club set with bag and accessories.",2800,"Sports","Used - Good","Kumasi","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400","Golf Balls, Cash"
"Boxing Gloves","Professional boxing gloves and training equipment.",180,"Sports","Used - Good","Accra","https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400","Punching Bag, Cash"
"Bicycle Mountain","26-inch mountain bike suitable for off-road cycling.",850,"Sports","Used - Like New","Tema","https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400","Road Bike, Cash"
"Power Tools Set","Complete power tool set including drill, saw, and sanders.",1200,"Tools & Hardware","Used - Good","Accra","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Hand Tools, Cash"
"Toolbox Professional","Large professional toolbox with various hand tools.",650,"Tools & Hardware","Used - Like New","Tema","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Tool Cabinet, Cash"
"Welding Equipment","Arc welding machine with accessories and safety gear.",2800,"Tools & Hardware","Used - Good","Kumasi","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Angle Grinder, Cash"
"Ladder Aluminum","Extendable aluminum ladder suitable for home and professional use.",450,"Tools & Hardware","Used - Good","Accra","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","Step Ladder, Cash"
"Generator Portable","5KVA portable generator perfect for backup power.",3500,"Tools & Hardware","Used - Like New","Tema","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400","UPS System, Cash"
"Board Games Set","Collection of family board games for entertainment.",180,"Toys & Games","Used - Good","Accra","https://images.unsplash.com/photo-1558877385-bc7c71e40c23?w=400","Card Games, Cash"
"Remote Control Car","High-speed RC car with rechargeable battery.",320,"Toys & Games","Used - Like New","Tema","https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400","Drone, Cash"
"Puzzle Collection","1000-piece jigsaw puzzles with beautiful images.",120,"Toys & Games","New","Kumasi","https://images.unsplash.com/photo-1558877385-bc7c71e40c23?w=400","3D Puzzles, Cash"
"Action Figure Set","Superhero action figures with accessories.",220,"Toys & Games","New","Accra","https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400","Dolls, Cash"
"Educational Toys","STEM learning toys for children ages 5-12.",280,"Toys & Games","Used - Good","Tema","https://images.unsplash.com/photo-1558877385-bc7c71e40c23?w=400","Art Supplies, Cash"
"Motorcycle Honda 150","150cc Honda motorcycle in excellent running condition.",12000,"Vehicles","Used - Good","Accra","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400","Other Motorcycles, Cash"
"Pickup Truck Ford","Ford pickup truck perfect for construction and farming.",68000,"Vehicles","Used - Good","Tema","https://images.unsplash.com/photo-1562141961-d1f1d5a8a76c?w=400","Other Trucks, Cash"
"Sedan Toyota Camry","2020 Toyota Camry in excellent condition with low mileage.",85000,"Vehicles","Used - Like New","Kumasi","https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400","Other Sedans, Cash"
"SUV Honda Pilot","7-seater Honda Pilot SUV perfect for families.",95000,"Vehicles","Used - Good","Accra","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400","Other SUVs, Cash"
"Van Commercial","Commercial van suitable for delivery and cargo transport.",55000,"Vehicles","Used - Good","Tema","https://images.unsplash.com/photo-1562141961-d1f1d5a8a76c?w=400","Minibus, Cash"
"PlayStation 5 Console","Sony PlayStation 5 with 2 controllers and popular games.",4500,"Video Games","Used - Like New","Accra","https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400","Xbox Series X, Cash"
"Gaming Headset","Wireless gaming headset with surround sound.",320,"Video Games","Used - Good","Tema","https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400","Gaming Mouse, Cash"
"Game Collection","Collection of 20 popular video games for various consoles.",850,"Video Games","Used - Good","Kumasi","https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400","Single Games, Cash"
"Gaming Chair","Ergonomic gaming chair with RGB lighting.",650,"Video Games","Used - Like New","Accra","https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400","Desk Setup, Cash"
"VR Headset","Virtual reality headset with motion controllers.",1800,"Video Games","Used - Good","Tema","https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400","VR Games, Cash"
"Antique Furniture","Victorian-era wooden furniture in restored condition.",5500,"Vintage & Antiques","Used - Good","Accra","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400","Modern Furniture, Cash"
"Vintage Camera","Classic film camera with leather case.",850,"Vintage & Antiques","Used - Like New","Tema","https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400","Digital Camera, Cash"
"Old Books Collection","Rare and antique books from colonial era.",1200,"Vintage & Antiques","Used - Good","Kumasi","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400","Modern Books, Cash"
"Vintage Jewelry","Antique jewelry pieces from early 1900s.",2800,"Vintage & Antiques","Used - Like New","Accra","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400","Modern Jewelry, Cash"
"Antique Clock","Grandfather clock with pendulum in working condition.",3500,"Vintage & Antiques","Used - Good","Tema","https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400","Wall Clock, Cash"
"Mixed Electronics","Various electronic items and gadgets.",450,"Other","Used - Good","Accra","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400","Computer Parts, Cash"
"Crafting Supplies","Complete crafting supply kit for DIY projects.",220,"Other","New","Tema","https://images.unsplash.com/photo-1577720643271-6760b6dc2054?w=400","Art Materials, Cash"
"Building Materials","Surplus building materials including tiles and fittings.",850,"Other","Used - Good","Kumasi","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400","Construction Tools, Cash"
"Household Items","Various household items including cleaning supplies.",180,"Other","Used - Good","Accra","https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400","Storage Boxes, Cash"
"Professional Services","Consultation and professional service packages.",500,"Other","New","Tema","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400","Training Courses, Cash"`;

  const loadSampleData = () => {
    setCsvData(sampleData);
    toast({
      title: "Sample Data Loaded",
      description: "Ghana marketplace sample data has been loaded. You can edit it before importing.",
    });
  };

  const parseCsvData = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data or load sample data first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const parsedProducts: BulkProduct[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('","').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= 6) {
          const product: BulkProduct = {
            title: values[0],
            description: values[1],
            price: parseFloat(values[2]) || 0,
            category: values[3],
            condition: values[4],
            location: values[5],
            images: values[6] ? [values[6]] : ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400"],
            wanted_items: values[7] ? values[7].split(',').map(item => item.trim()) : []
          };
          parsedProducts.push(product);
        }
      }
      
      setProducts(parsedProducts);
      toast({
        title: "CSV Parsed Successfully",
        description: `${parsedProducts.length} products parsed and ready to import.`,
      });
    } catch (error) {
      toast({
        title: "Error Parsing CSV",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    }
  };

  const importProducts = async () => {
    if (products.length === 0) {
      toast({
        title: "Error",
        description: "No products to import. Please parse CSV data first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, create sample user profiles for the products if they don't exist
      const sampleUserIds = await createSampleUsers();
      
      // Convert products to database format
      const listingsData = products.map((product, index) => ({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        condition: product.condition,
        location: product.location,
        images: product.images,
        wanted_items: product.wanted_items,
        user_id: sampleUserIds[0], // All products uploaded by KentaKart
        status: 'active'
      }));

      const { data, error } = await supabase
        .from('listings')
        .insert(listingsData);

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `${products.length} products have been imported successfully.`,
      });

      setProducts([]);
      setCsvData("");
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleUsers = async () => {
    // Create or get the KentaKart user
    const kentaKartUser = {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      first_name: 'KentaKart',
      last_name: 'Marketplace',
      username: 'KentaKart',
      location: 'Accra, Ghana',
      region: 'Greater Accra',
      city: 'Accra',
      bio: 'Premium marketplace offering quality products across Ghana',
      rating: 4.9,
      total_sales: 150,
      is_verified: true
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(kentaKartUser, { onConflict: 'id' });
      
      if (error) {
        console.log('KentaKart user creation error:', error);
      }
      
      return [kentaKartUser.id];
    } catch (error) {
      console.log('Error creating KentaKart user:', error);
      return [user?.id]; // Fallback to current user if KentaKart user creation fails
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `title,description,price,category,condition,location,images,wanted_items
"Product Title","Product description here",100,"Electronics","New","Accra","https://example.com/image.jpg","Item 1, Item 2"`;
    
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Product Import
          </CardTitle>
          <CardDescription>
            Import multiple products at once using CSV format or start with sample Ghana marketplace data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadSampleData} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Load Ghana Sample Data
            </Button>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* CSV Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here or load sample data..."
              className="h-40 font-mono text-sm"
            />
          </div>

          {/* Parse and Import Buttons */}
          <div className="flex gap-3">
            <Button onClick={parseCsvData} variant="outline">
              Parse CSV Data
            </Button>
            <Button 
              onClick={importProducts} 
              disabled={loading || products.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Importing..." : `Import ${products.length} Products`}
            </Button>
          </div>

          {/* Preview */}
          {products.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({products.length} products)</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto bg-muted/50">
                {products.slice(0, 3).map((product, index) => (
                  <div key={index} className="mb-3 pb-3 border-b last:border-b-0">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-sm text-muted-foreground">
                      ₵{product.price} • {product.category} • {product.location}
                    </div>
                  </div>
                ))}
                {products.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... and {products.length - 3} more products
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};