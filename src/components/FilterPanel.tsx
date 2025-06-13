
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, X, Star, MessageCircle } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";

interface FilterPanelProps {
  onFilterChange: (filters: {
    category: string;
    condition: string;
    location: string;
    radius: number;
    minRating: number;
  }) => void;
  isVisible: boolean;
}

export const FilterPanel = ({ onFilterChange, isVisible }: FilterPanelProps) => {
  const { 
    selectedCategory, setSelectedCategory,
    selectedCondition, setSelectedCondition,
    swapFilter, setSwapFilter
  } = useListingStore();
  
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedRadius, setSelectedRadius] = useState([5]);
  const [minRating, setMinRating] = useState([0]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Books", label: "Books" },
    { value: "Kitchen", label: "Kitchen" },
    { value: "Fitness", label: "Fitness" },
    { value: "Clothing", label: "Clothing" },
    { value: "Home & Garden", label: "Home & Garden" },
    { value: "Tools", label: "Tools" },
    { value: "Sports", label: "Sports" }
  ];

  const conditions = [
    { value: "all", label: "All Conditions" },
    { value: "Like New", label: "Like New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Needs Repair", label: "Needs Repair" }
  ];

  const swapStatuses = [
    { value: "all", label: "All Items" },
    { value: "unswapped", label: "Available" },
    { value: "swapped", label: "Message Sent" }
  ];

  const applyFilters = () => {
    onFilterChange({
      category: selectedCategory,
      condition: selectedCondition,
      location: selectedLocation,
      radius: selectedRadius[0],
      minRating: minRating[0]
    });
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCondition("");
    setSwapFilter("all");
    setSelectedLocation("");
    setSelectedRadius([5]);
    setMinRating([0]);
    onFilterChange({
      category: "",
      condition: "",
      location: "",
      radius: 5,
      minRating: 0
    });
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6 border-emerald-200 shadow-lg">
      <CardContent className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setTimeout(applyFilters, 0);
          }}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCondition} onValueChange={(value) => {
            setSelectedCondition(value);
            setTimeout(applyFilters, 0);
          }}>
            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-emerald-200">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              {conditions.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Input
            placeholder="ZIP code or city"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setTimeout(applyFilters, 0);
            }}
            className="bg-white/80 backdrop-blur-sm border-emerald-200"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">Distance: {selectedRadius[0]} miles</label>
            <Slider
              value={selectedRadius}
              onValueChange={(value) => {
                setSelectedRadius(value);
                setTimeout(applyFilters, 0);
              }}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-emerald-800 mb-2 block">
            Minimum Rating: {minRating[0]} star{minRating[0] !== 1 ? 's' : ''}
          </label>
          <Slider
            value={minRating}
            onValueChange={(value) => {
              setMinRating(value);
              setTimeout(applyFilters, 0);
            }}
            max={5}
            min={0}
            step={1}
            className="w-full max-w-xs"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedCategory && selectedCategory !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
            {selectedCondition && selectedCondition !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {conditions.find(c => c.value === selectedCondition)?.label}
              </Badge>
            )}
            {swapFilter !== "all" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <MessageCircle className="w-3 h-3 mr-1" />
                {swapStatuses.find(s => s.value === swapFilter)?.label}
              </Badge>
            )}
            {selectedLocation && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedLocation} ({selectedRadius[0]} mi)
              </Badge>
            )}
            {minRating[0] > 0 && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <Star className="w-3 h-3 mr-1" />
                {minRating[0]}+ stars
              </Badge>
            )}
          </div>
          {(selectedCategory !== "all" || selectedCondition !== "all" || swapFilter !== "all" || selectedLocation || minRating[0] > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="border-emerald-200">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
