
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, X, Heart } from "lucide-react";
import { useMessageStore } from "@/stores/messageStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SearchAndFilterProps {
  onSearch: (keyword: string) => void;
  onFilterChange: (filters: {
    category: string;
    condition: string;
    location: string;
    radius: number;
  }) => void;
  onBack: () => void;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface Condition {
  id: string;
  name: string;
  value: string;
  display_order: number;
  is_active: boolean;
}

export const SearchAndFilter = ({ onSearch, onFilterChange, onBack }: SearchAndFilterProps) => {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  
  const { toast } = useToast();

  const radiusOptions = [1, 2, 5, 10, 15, 25, 50];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch conditions
        const { data: conditionsData, error: conditionsError } = await supabase
          .from('conditions')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
        } else {
          setConditions(conditionsData || []);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Updated mock data with categories that exist in the database
  const mockItems = [
    {
      id: 1,
      title: "Vintage Coffee Maker",
      description: "Great condition, just upgraded to a newer model",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      user: "Sarah M.",
      location: "0.8 miles away",
      category: "Kitchen & Dining",
      condition: "Like New",
      wantedItems: ["Books", "Home & Garden", "Electronics"]
    },
    {
      id: 2,
      title: "Programming Books Collection",
      description: "React, JavaScript, and Python books - perfect for learning",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      user: "Mike K.",
      location: "1.2 miles away",
      category: "Books",
      condition: "Used - Good",
      wantedItems: ["Electronics", "Kitchen & Dining"]
    },
    {
      id: 3,
      title: "Yoga Mat & Blocks",
      description: "Barely used yoga set, perfect for home workouts",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      user: "Emma L.",
      location: "0.5 miles away",
      category: "Fitness Equipment",
      condition: "Like New",
      wantedItems: ["Home & Garden", "Books"]
    },
    {
      id: 4,
      title: "Acoustic Guitar",
      description: "Beautiful sound, includes case and picks",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      user: "Jake R.",
      location: "2.1 miles away",
      category: "Musical Instruments",
      condition: "Used - Good",
      wantedItems: ["Books", "Kitchen & Dining"]
    },
    {
      id: 5,
      title: "Designer Jacket",
      description: "High-quality winter coat, barely worn",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop",
      user: "Alex T.",
      location: "1.8 miles away",
      category: "Clothing",
      condition: "Like New",
      wantedItems: ["Electronics", "Sports"]
    }
  ];

  const [filteredItems, setFilteredItems] = useState(mockItems);

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    onSearch(value);
    applyFilters(value, selectedCategory, selectedCondition);
  };

  const applyFilters = (searchKeyword: string, category: string, condition: string) => {
    let filtered = mockItems;

    // Apply keyword search
    if (searchKeyword.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.wantedItems.some(wanted => wanted.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter(item => item.category === category);
    }

    // Apply condition filter
    if (condition !== "all") {
      filtered = filtered.filter(item => item.condition === condition);
    }

    setFilteredItems(filtered);
    onFilterChange({
      category,
      condition,
      location: selectedLocation,
      radius: selectedRadius
    });
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSelectedLocation("");
    setSelectedRadius(5);
    setFilteredItems(mockItems);
    onSearch("");
    onFilterChange({
      category: "all",
      condition: "all",
      location: "",
      radius: 5
    });
  };

  const handleItemLike = async (item: any) => {
    try {
      // Navigate to messages to start conversation
      toast({
        title: "Interest Sent!",
        description: `You've expressed interest in ${item.title}. Navigate to messages to start a conversation.`,
      });
      console.log(`Expressed interest in ${item.title} with ${item.user}`);
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <X className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Browse & Search</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search for items (e.g., guitar, books, kitchen)"
                value={keyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                applyFilters(keyword, value, selectedCondition);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={(value) => {
                setSelectedCondition(value);
                applyFilters(keyword, selectedCategory, value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.name}>
                      {condition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="ZIP code or city"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />

              <Select value={selectedRadius.toString()} onValueChange={(value) => setSelectedRadius(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((radius) => (
                    <SelectItem key={radius} value={radius.toString()}>
                      {radius} mile{radius !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters & Clear */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {keyword && (
                  <Badge variant="secondary">
                    Search: "{keyword}"
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary">
                    {selectedCategory}
                  </Badge>
                )}
                {selectedCondition !== "all" && (
                  <Badge variant="secondary">
                    {selectedCondition}
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedLocation} ({selectedRadius} mi)
                  </Badge>
                )}
              </div>
              {(keyword || selectedCategory !== "all" || selectedCondition !== "all" || selectedLocation) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </h2>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-white/90 text-gray-900">
                  {item.category}
                </Badge>
                <Button
                  className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-0"
                  variant="ghost"
                  onClick={() => handleItemLike(item)}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {item.condition}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {item.location}
                </div>
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-900 mb-1">Looking for:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.wantedItems.slice(0, 2).map((wanted, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {wanted}
                      </Badge>
                    ))}
                    {item.wantedItems.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.wantedItems.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                      {item.user.charAt(0)}
                    </div>
                    <div className="text-sm text-gray-900">{item.user}</div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    onClick={() => handleItemLike(item)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more items.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear filters and search
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};
