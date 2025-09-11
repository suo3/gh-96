import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, SlidersHorizontal } from "lucide-react";
import { ItemGrid } from "@/components/ItemGrid";
import { FilterPanel } from "@/components/FilterPanel";
import { ContentControls } from "@/components/ContentControls";
import { Listing, useListingStore } from "@/stores/listingStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "@/components/Footer";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { FeaturedStoresCarousel } from "@/components/FeaturedStoresCarousel";

type FilterOptions = {
  category: string;
  condition: string;
  location: string;
  radius: number;
  minRating: number;
};

export default function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categoryName, setCategoryName] = useState<string>("");
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  const { listings, fetchListings } = useListingStore();

  useEffect(() => {
    if (categorySlug) {
      // Convert slug back to category name
      const name = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/And/g, '&'); // Handle "Home & Garden" case
      
      setCategoryName(name);
      fetchListings();
    }
  }, [categorySlug, fetchListings]);

  useEffect(() => {
    if (listings.length > 0 && categoryName) {
      const categoryListings = listings.filter(
        listing => listing.category === categoryName && listing.status === 'active'
      );
      setFilteredListings(categoryListings);
      setLoading(false);
    } else if (listings.length > 0) {
      setLoading(false);
    }
  }, [listings, categoryName]);

  const handleFilterChange = (filters: FilterOptions) => {
    if (!categoryName) return;
    
    let filtered = listings.filter(
      listing => listing.category === categoryName && listing.status === 'active'
    );

    // Apply filters
    if (filters.condition && filters.condition !== 'all') {
      filtered = filtered.filter(listing => listing.condition === filters.condition);
    }

    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <div className="h-12 bg-muted rounded w-64 mb-4"></div>
            <div className="h-6 bg-muted rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categorySlugForSEO = categorySlug || 'unknown';
  const itemCount = filteredListings.length;

  return (
    <>
      <Helmet>
        <title>{categoryName} - SwapBoard Ghana Trading Platform</title>
        <meta 
          name="description" 
          content={`Browse ${itemCount} ${categoryName.toLowerCase()} items on SwapBoard Ghana. Find great deals on ${categoryName.toLowerCase()} in Ghana's trusted trading marketplace.`} 
        />
        <meta name="keywords" content={`${categoryName.toLowerCase()}, ghana marketplace, trading, ${categorySlugForSEO}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Featured Stores Carousel */}
        <FeaturedStoresCarousel />
        
        {/* Header */}
        <div className="bg-card/50 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <Link to="/categories">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Categories
              </Button>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10">
                  {(() => {
                    const IconComponent = getCategoryIcon(categoryName);
                    return <IconComponent className="h-8 w-8 text-primary" />;
                  })()}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {categoryName}
                  </h1>
                  <Badge variant="outline" className="text-sm">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} available
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                <Link to="/post">
                  <Button size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    List Item
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Controls */}
        {itemCount > 0 && (
          <div className="bg-card/50 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {itemCount === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="mx-auto mb-6 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No items in {categoryName} yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to list an item in this category and start trading!
              </p>
              <Link to="/post">
                <Button size="lg">
                  List First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Filters - Desktop */}
              {!isMobile && showFilters && (
                <div className="w-80 flex-shrink-0">
                  <FilterPanel 
                    onFilterChange={handleFilterChange}
                    isVisible={true}
                  />
                </div>
              )}

              {/* Items Grid */}
              <div className="flex-1">
                <ItemGrid items={filteredListings} onItemLike={async (item) => {
                  // For category page, heart should add to favorites, not create conversation
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}