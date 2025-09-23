import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemGrid } from "@/components/ItemGrid";
import { Star, Crown, Zap, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "@/utils/categoryIcons";

export const CategoryTabsCarousel = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch categories and auto-select most popular
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Get category with most items
  const { data: categoryCounts } = useQuery({
    queryKey: ['categoryCounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('category')
        .eq('status', 'active');
      
      if (error) throw error;
      
      const counts = data.reduce((acc: Record<string, number>, listing) => {
        acc[listing.category] = (acc[listing.category] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(counts)
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => ({ category, count }));
    },
  });

  // Auto-select most popular category
  useEffect(() => {
    if (categoryCounts && categoryCounts.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryCounts[0].category);
    }
  }, [categoryCounts, selectedCategory]);

  // Fetch category items (promoted first, then regular items)
  const { data: categoryItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['categoryItems', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];

      // First get promoted items for this category
      const { data: promotedItems } = await supabase
        .from('promoted_items')
        .select(`
          *,
          listing:listings!inner(
            *,
            profiles(
              id,
              first_name,
              last_name,
              username,
              avatar,
              rating,
              total_sales
            )
          )
        `)
        .eq('status', 'active')
        .eq('promotion_type', 'category_featured')
        .gte('ends_at', new Date().toISOString())
        .ilike('listing.category', selectedCategory);

      // Then get regular items - use case-insensitive search and remove rating filter
      const { data: regularItems } = await supabase
        .from('listings')
        .select(`
          *,
          profiles(
            id,
            first_name,
            last_name,
            username,
            avatar,
            rating,
            total_sales
          )
        `)
        .ilike('category', selectedCategory)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      // Combine and deduplicate
      const promoted = promotedItems?.filter(p => p.listing).map(p => {
        const listing = p.listing as any;
        return { ...listing, isPromoted: true };
      }) || [];
      
      const regular = regularItems?.filter(item => 
        !promoted.some(p => p.id === item.id)
      ).map(item => ({ ...item, isPromoted: false })) || [];

      return [...promoted, ...regular];
    },
    enabled: !!selectedCategory,
  });

  if (!categories || categories.length === 0) {
    return null;
  }

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs Carousel */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-primary-800" />
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <CarouselItem key={category.id} className="pl-2 basis-auto">
                  <Button
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? null : category.name
                    )}
                    className={`whitespace-nowrap flex border-primary items-center gap-2 ${
                      selectedCategory === category.name 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      {/* Category Items */}
      {selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              {selectedCategory} Items
            </h3>
            <Badge variant="outline">
              {categoryItems?.length || 0} items
            </Badge>
          </div>

          {itemsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : categoryItems && categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryItems.map((item: any) => {
                const firstImage = item.images?.[0];
                const profile = item.profiles;
                const displayName = profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : profile?.username || 'Anonymous';

                return (
                  <Card 
                    key={item.id}
                    className="group border border-black cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <div className="text-muted-foreground text-sm">No image</div>
                        </div>
                      )}
                      
                      {/* Enhanced promoted badge */}
                      {item.isPromoted && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg border border-primary/20">
                          <Crown className="h-3 w-3 mr-1 text-yellow-300" />
                          <span className="font-semibold">PROMOTED</span>
                        </Badge>
                      )}

                      {/* Heart icon */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white text-muted-foreground hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add favorite logic here
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-3">
                      <h4 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      
                      {item.price && (
                        <p className="text-lg font-bold text-primary mb-2">
                          ₵{parseFloat(item.price).toLocaleString()}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{item.location || 'Location not specified'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-16">
                            {displayName}
                          </span>
                        </div>

                        {profile?.rating && profile.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{profile.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No items found in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
};