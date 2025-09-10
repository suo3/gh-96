import { 
  Package, 
  Smartphone, 
  Car, 
  Shirt, 
  Home, 
  Gamepad2, 
  Book, 
  Baby, 
  Dumbbell, 
  Music, 
  Palette, 
  Wrench, 
  ShoppingBag,
  Sparkles,
  Coffee,
  Camera,
  Piano,
  Briefcase,
  Heart,
  ShirtIcon,
  LucideIcon,
  ChefHat,
  Sofa,
  Trees,
  Watch,
  Monitor,
  Trophy,
  Star,
  GiftIcon
} from "lucide-react";

// Comprehensive category icon mapping for Ghana marketplace
export const categoryIcons: Record<string, LucideIcon> = {
  // Electronics & Tech
  "Electronics": Smartphone,
  "Video Games": Gamepad2,
  "Computers": Monitor,
  "Cameras": Camera,
  
  // Vehicles
  "Vehicles": Car,
  "Automotive": Car,
  "Cars": Car,
  
  // Fashion & Clothing
  "Fashion": Shirt,
  "Clothing": Shirt,
  "Shoes": ShirtIcon,
  "Bags & Luggage": ShoppingBag,
  "Jewelry & Accessories": Watch,
  
  // Home & Living
  "Home & Garden": Home,
  "Furniture": Sofa,
  "Kitchen & Dining": ChefHat,
  "Appliances": Coffee,
  "Garden & Outdoor": Trees,
  "Office Supplies": Briefcase,
  
  // Entertainment & Media
  "Books": Book,
  "Music": Music,
  "Musical Instruments": Piano,
  "Movies & TV": Monitor,
  
  // Health & Family
  "Baby & Kids": Baby,
  "Beauty & Health": Sparkles,
  "Pet Supplies": Heart,
  
  // Sports & Recreation
  "Sports": Dumbbell,
  "Fitness Equipment": Dumbbell,
  "Toys & Games": GiftIcon,
  
  // Arts & Crafts
  "Art & Crafts": Palette,
  "Collectibles": Star,
  "Vintage & Antiques": Trophy,
  
  // Tools & Hardware
  "Tools & Hardware": Wrench,
  
  // Default
  "Other": Package,
  "default": Package
};

// Helper function to get icon for category name
export const getCategoryIcon = (categoryName: string): LucideIcon => {
  // Normalize the category name and check for exact matches first
  const normalizedName = categoryName.trim();
  
  if (categoryIcons[normalizedName]) {
    return categoryIcons[normalizedName];
  }
  
  // Check for partial matches for flexibility
  const lowerCaseName = normalizedName.toLowerCase();
  
  if (lowerCaseName.includes('electronic') || lowerCaseName.includes('phone') || lowerCaseName.includes('computer')) {
    return Smartphone;
  }
  if (lowerCaseName.includes('car') || lowerCaseName.includes('vehicle') || lowerCaseName.includes('auto')) {
    return Car;
  }
  if (lowerCaseName.includes('fashion') || lowerCaseName.includes('cloth') || lowerCaseName.includes('dress')) {
    return Shirt;
  }
  if (lowerCaseName.includes('home') || lowerCaseName.includes('house') || lowerCaseName.includes('furniture')) {
    return Home;
  }
  if (lowerCaseName.includes('game') || lowerCaseName.includes('gaming')) {
    return Gamepad2;
  }
  if (lowerCaseName.includes('book') || lowerCaseName.includes('read')) {
    return Book;
  }
  if (lowerCaseName.includes('baby') || lowerCaseName.includes('kid') || lowerCaseName.includes('child')) {
    return Baby;
  }
  if (lowerCaseName.includes('sport') || lowerCaseName.includes('fitness') || lowerCaseName.includes('gym')) {
    return Dumbbell;
  }
  if (lowerCaseName.includes('music') || lowerCaseName.includes('instrument')) {
    return Music;
  }
  if (lowerCaseName.includes('art') || lowerCaseName.includes('craft') || lowerCaseName.includes('paint')) {
    return Palette;
  }
  if (lowerCaseName.includes('tool') || lowerCaseName.includes('hardware') || lowerCaseName.includes('repair')) {
    return Wrench;
  }
  if (lowerCaseName.includes('bag') || lowerCaseName.includes('luggage') || lowerCaseName.includes('backpack')) {
    return ShoppingBag;
  }
  if (lowerCaseName.includes('beauty') || lowerCaseName.includes('health') || lowerCaseName.includes('cosmetic')) {
    return Sparkles;
  }
  if (lowerCaseName.includes('kitchen') || lowerCaseName.includes('dining') || lowerCaseName.includes('cook')) {
    return ChefHat;
  }
  if (lowerCaseName.includes('garden') || lowerCaseName.includes('outdoor') || lowerCaseName.includes('plant')) {
    return Trees;
  }
  if (lowerCaseName.includes('jewelry') || lowerCaseName.includes('watch') || lowerCaseName.includes('accessory')) {
    return Watch;
  }
  if (lowerCaseName.includes('office') || lowerCaseName.includes('business') || lowerCaseName.includes('work')) {
    return Briefcase;
  }
  if (lowerCaseName.includes('pet') || lowerCaseName.includes('animal')) {
    return Heart;
  }
  if (lowerCaseName.includes('toy') || lowerCaseName.includes('gift')) {
    return GiftIcon;
  }
  if (lowerCaseName.includes('vintage') || lowerCaseName.includes('antique') || lowerCaseName.includes('collectible')) {
    return Trophy;
  }
  
  // Default fallback
  return Package;
};