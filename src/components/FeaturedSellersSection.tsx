import { useFeaturedSellers } from "@/hooks/usePromotions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Users, Medal, MapPin, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedSellersSection = () => {
  const navigate = useNavigate();

  const { data: featuredSellers, isLoading } = useFeaturedSellers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!featuredSellers || featuredSellers.length === 0) {
    return null;
  }

  const handleSellerClick = (sellerId: string) => {
    navigate(`/user/${sellerId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Medal className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Featured Sellers</h2>
        <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          Trusted
        </Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {featuredSellers.map((seller: any) => {
            const profile = seller.profiles;
            if (!profile) return null;

            const displayName = profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}` 
              : profile.username || 'Anonymous';

            return (
              <CarouselItem key={seller.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
                  onClick={() => handleSellerClick(profile.id)}
                >
                  <CardContent className="p-6 text-center">
                    {/* Avatar */}
                    <div className="relative mx-auto mb-4">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={displayName}
                          className="w-16 h-16 rounded-full object-cover mx-auto ring-4 ring-orange-200 group-hover:ring-orange-300 transition-all"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center mx-auto text-white font-bold text-xl ring-4 ring-orange-200 group-hover:ring-orange-300 transition-all">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      <Badge className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        <Medal className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {displayName}
                    </h3>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      {profile.rating && profile.rating > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{profile.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">rating</span>
                        </div>
                      )}

                      {profile.total_sales && profile.total_sales > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{profile.total_sales}</span>
                          <span className="text-sm text-muted-foreground">sales</span>
                        </div>
                      )}
                    </div>

                    {/* View Profile Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSellerClick(profile.id);
                      }}
                    >
                      View Profile
                    </Button>
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