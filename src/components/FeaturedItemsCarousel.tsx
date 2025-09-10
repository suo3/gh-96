import { usePromotedItems } from "@/hooks/usePromotions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Crown, Star, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const FeaturedItemsCarousel = () => {
  const { data: promotedItems, isLoading } = usePromotedItems('featured');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg animate-pulse" />
    );
  }

  if (!promotedItems || promotedItems.length === 0) {
    return null;
  }

  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Featured Items
        </h2>
        <Badge variant="secondary" className="ml-2">Hot Deals</Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {promotedItems.map((item) => {
            const listing = item.listing;
            if (!listing) return null;

            const firstImage = listing.images?.[0];
            const profile = listing.profiles;
            const displayName = profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}` 
              : profile?.username || 'Anonymous';

            return (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gradient-to-r from-primary to-accent bg-gradient-card shadow-gold relative overflow-hidden"
                  onClick={() => handleItemClick(listing.id)}
                >
                  {/* Premium glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 opacity-50"></div>
                  
                  <div className="relative overflow-hidden rounded-t-lg">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={listing.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">No image</div>
                      </div>
                    )}
                    
                    {/* Enhanced featured badge with animation */}
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg animate-pulse border border-primary/20">
                      <Crown className="h-3 w-3 mr-1 text-yellow-300" />
                      <span className="font-semibold">FEATURED</span>
                    </Badge>
                    
                    {/* Premium corner ribbon */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-3 right-[-20px] w-20 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold text-white text-center leading-4 transform rotate-45 shadow-md">
                        VIP
                      </div>
                    </div>

                    {/* Heart icon */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white text-muted-foreground hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add favorite logic here
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                    
                    {listing.price && (
                      <p className="text-xl font-bold text-primary mb-2">
                        ₵{parseFloat(listing.price).toLocaleString()}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{listing.location || 'Location not specified'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-20">
                          {displayName}
                        </span>
                      </div>

                      {profile?.rating && profile.rating > 1 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{profile.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
};