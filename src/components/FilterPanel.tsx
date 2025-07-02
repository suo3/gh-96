
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
    geocodeLocation
  } = useListingStore();
  
  const { user } = useAuthStore();
  
  const [selectedRadius, setSelectedRadius] = useState([maxDistance]);
  const [selectedMinRating, setSelectedMinRating] = useState([minRating]);
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
      minRating: selectedMinRating[0]
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
    onFilterChange({
      category: "",
      condition: "",
      location: user?.location || "",
      radius: 25,
      minRating: 0
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

  if (!isVisible) return null;

  const CardWrapper = isMobile ? 'div' : Card;
  const ContentWrapper = isMobile ? 'div' : CardContent;
  
  const cardProps = isMobile ? {} : { className: "mb-6 border-emerald-200 shadow-lg" };
  const contentProps = isMobile ? 
    { className: "space-y-6" } : 
    { className: "p-6 bg-gradient-to-r from-emerald-50 to-teal-50" };

  return (
    <CardWrapper {...cardProps}>
      <ContentWrapper {...contentProps}>
        {/* Search Bar - Only show if showSearch is true */}
        {showSearch && (
          <div className={isMobile ? "mb-6" : "mb-4"}>
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border-emerald-200"
            />
          </div>
        )}

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'} ${isMobile ? 'mb-6' : 'mb-4'}`}>
          {/* Category Select */}
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setTimeout(applyFilters, 0);
          }} disabled={isLoadingOptions}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Category"} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Condition Select */}
          <Select value={selectedCondition} onValueChange={(value) => {
            setSelectedCondition(value);
            setTimeout(applyFilters, 0);
          }} disabled={isLoadingOptions}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder={isLoadingOptions ? "Loading..." : "Condition"} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((condition) => (
                <SelectItem key={condition.id} value={condition.value}>
                  {condition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Select */}
          <Select value={swapFilter} onValueChange={setSwapFilter}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              {swapStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Field */}
          {!isMobile && (
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-600" />
              <Input
                placeholder="Set location in profile"
                value={user?.location || ""}
                readOnly
                className="bg-gray-100/80 backdrop-blur-sm border-emerald-200 pl-10 cursor-not-allowed"
                title="Update your location in your profile settings"
              />
            </div>
          )}
        </div>

        {/* Distance Filter */}
        <div className={isMobile ? "mb-6" : "mb-4"}>
          <label className="text-sm font-medium text-emerald-800 mb-2 block">
            Distance: {selectedRadius[0]} miles from your location
          </label>
          <Slider
            value={selectedRadius}
            onValueChange={handleDistanceChange}
            max={100}
            min={1}
            step={1}
            className="w-full max-w-md"
          />
        </div>

        {/* Rating Filter */}
        <div className={isMobile ? "mb-6" : "mb-4"}>
          <label className="text-sm font-medium text-emerald-800 mb-2 block">
            Minimum Rating: {selectedMinRating[0]} star{selectedMinRating[0] !== 1 ? 's' : ''}
          </label>
          <Slider
            value={selectedMinRating}
            onValueChange={handleRatingChange}
            max={5}
            min={0}
            step={1}
            className="w-full max-w-xs"
          />
        </div>

        {/* Active Filters and Clear Button */}
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory && selectedCategory !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {categories.find(c => c.name === selectedCategory)?.name || selectedCategory}
              </Badge>
            )}
            {selectedCondition && selectedCondition !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {conditions.find(c => c.value === selectedCondition)?.name || selectedCondition}
              </Badge>
            )}
            {swapFilter !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <MessageCircle className="w-3 h-3 mr-1" />
                {swapStatuses.find(s => s.value === swapFilter)?.label}
              </Badge>
            )}
            {user?.location && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <MapPin className="w-3 h-3 mr-1" />
                {user.location} ({selectedRadius[0]} mi)
              </Badge>
            )}
            {sortBy !== "newest" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                Sort: {sortOptions.find(s => s.value === sortBy)?.label}
              </Badge>
            )}
            {minRating > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <Star className="w-3 h-3 mr-1" />
                {minRating}+ stars
              </Badge>
            )}
          </div>
          {(selectedCategory !== "all" || selectedCondition !== "all" || swapFilter !== "all" || minRating > 0 || searchTerm || sortBy !== "newest") && (
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"} 
              onClick={clearFilters} 
              className={`border-emerald-200 ${isMobile ? 'w-full' : ''}`}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      </ContentWrapper>
    </CardWrapper>
  );
};
