
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, X, Star, MessageCircle, Navigation } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

interface FilterPanelProps {
  onFilterChange: (filters: {
    category: string;
    condition: string;
    location: string;
    radius: number;
    minRating: number;
    priceRange: [number, number];
  }) => void;
  isVisible: boolean;
  isMobile?: boolean;
  showSearch?: boolean;
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

export const FilterPanel = ({ onFilterChange, isVisible, isMobile = false, showSearch = true }: FilterPanelProps) => {
  const { 
    selectedCategory, setSelectedCategory,
    selectedCondition, setSelectedCondition,
    swapFilter, setSwapFilter,
    maxDistance, setMaxDistance,
    minRating, setMinRating,
    searchTerm, setSearchTerm,
    sortBy, setSortBy,
    userLocation, setUserLocation,
    geocodeLocation,
    priceRange, setPriceRange
  } = useListingStore();
  
  const { user } = useAuthStore();
  
  const [selectedRadius, setSelectedRadius] = useState([maxDistance]);
  const [selectedMinRating, setSelectedMinRating] = useState([minRating]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRange);
  const [categories, setCategories] = useState<Category[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Fetch categories and conditions from database
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
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
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Initialize user location from profile
  useEffect(() => {
    const initializeUserLocation = async () => {
      if (user?.location && !userLocation) {
        const coords = await geocodeLocation(user.location);
        if (coords) {
          setUserLocation(coords);
        }
      }
    };
    
    initializeUserLocation();
  }, [user?.location, userLocation, geocodeLocation, setUserLocation]);

  const swapStatuses = [
    { value: "all", label: "All Items" },
    { value: "unswapped", label: "Available" },
    { value: "swapped", label: "Message Sent" }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "Alphabetical" },
    { value: "distance", label: "Distance" },
    { value: "views", label: "Most Viewed" },
    { value: "likes", label: "Most Liked" }
  ];

  const applyFilters = () => {
    onFilterChange({
      category: selectedCategory === "all" ? "" : selectedCategory,
      condition: selectedCondition === "all" ? "" : selectedCondition,
      location: user?.location || "",
      radius: selectedRadius[0],
      minRating: selectedMinRating[0],
      priceRange: selectedPriceRange
    });
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSwapFilter("all");
    setSearchTerm("");
    setSortBy("newest");
    setSelectedRadius([25]);
    setMaxDistance(25);
    setSelectedMinRating([0]);
    setMinRating(0);
    setSelectedPriceRange([0, 1000]);
    setPriceRange([0, 1000]);
    onFilterChange({
      category: "",
      condition: "",
      location: user?.location || "",
      radius: 25,
      minRating: 0,
      priceRange: [0, 1000]
    });
  };

  const handleDistanceChange = (value: number[]) => {
    setSelectedRadius(value);
    setMaxDistance(value[0]);
    setTimeout(applyFilters, 0);
  };

  const handleRatingChange = (value: number[]) => {
    setSelectedMinRating(value);
    setMinRating(value[0]);
    setTimeout(applyFilters, 0);
  };

  const handlePriceChange = (value: number[]) => {
    setSelectedPriceRange([value[0], value[1]]);
    setPriceRange([value[0], value[1]]);
    setTimeout(applyFilters, 0);
  };

  if (!isVisible) return null;

  return (
    <div className="h-full flex flex-col bg-background border-r">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground mb-1">Filters</h2>
        <p className="text-sm text-muted-foreground">Refine your search results</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search Bar */}
        {showSearch && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search</label>
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setTimeout(applyFilters, 0);
          }} disabled={isLoadingOptions}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingOptions ? "Loading..." : "All Categories"} />
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
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Condition</label>
          <Select value={selectedCondition} onValueChange={(value) => {
            setSelectedCondition(value);
            setTimeout(applyFilters, 0);
          }} disabled={isLoadingOptions}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingOptions ? "Loading..." : "All Conditions"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((condition) => (
                <SelectItem key={condition.id} value={condition.value}>
                  {condition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Availability</label>
          <Select value={swapFilter} onValueChange={setSwapFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Items" />
            </SelectTrigger>
            <SelectContent>
              {swapStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sort by</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Newest First" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Price Range (GH₵{selectedPriceRange[0]} - GH₵{selectedPriceRange[1]})
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Min"
              value={selectedPriceRange[0]}
              onChange={(e) => {
                const newMin = Math.max(0, parseInt(e.target.value) || 0);
                const newMax = Math.max(newMin, selectedPriceRange[1]);
                handlePriceChange([newMin, newMax]);
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={selectedPriceRange[1]}
              onChange={(e) => {
                const newMax = Math.max(selectedPriceRange[0], parseInt(e.target.value) || 1000);
                handlePriceChange([selectedPriceRange[0], newMax]);
              }}
            />
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Distance ({selectedRadius[0]} miles)
          </label>
          <Slider
            value={selectedRadius}
            onValueChange={handleDistanceChange}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 mi</span>
            <span>100 mi</span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Minimum Rating ({selectedMinRating[0]} star{selectedMinRating[0] !== 1 ? 's' : ''})
          </label>
          <Slider
            value={selectedMinRating}
            onValueChange={handleRatingChange}
            max={5}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 stars</span>
            <span>5 stars</span>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Your Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Set location in profile"
              value={user?.location || ""}
              readOnly
              className="pl-10 bg-muted cursor-not-allowed"
              title="Update your location in your profile settings"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory !== "all" || selectedCondition !== "all" || swapFilter !== "all" || minRating > 0 || searchTerm || sortBy !== "newest" || selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000) && (
          <div className="space-y-3 pt-4 border-t">
            <label className="text-sm font-medium text-foreground">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedCategory && selectedCategory !== "all" && (
                <Badge variant="secondary">
                  {categories.find(c => c.name === selectedCategory)?.name || selectedCategory}
                </Badge>
              )}
              {selectedCondition && selectedCondition !== "all" && (
                <Badge variant="secondary">
                  {conditions.find(c => c.value === selectedCondition)?.name || selectedCondition}
                </Badge>
              )}
              {swapFilter !== "all" && (
                <Badge variant="secondary">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {swapStatuses.find(s => s.value === swapFilter)?.label}
                </Badge>
              )}
              {sortBy !== "newest" && (
                <Badge variant="secondary">
                  Sort: {sortOptions.find(s => s.value === sortBy)?.label}
                </Badge>
              )}
              {(selectedPriceRange[0] > 0 || selectedPriceRange[1] < 1000) && (
                <Badge variant="secondary">
                  GH₵{selectedPriceRange[0]} - GH₵{selectedPriceRange[1]}
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  {minRating}+ stars
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters} 
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
