import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Users, Medal, MapPin, ShoppingBag, Award, Crown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedStore {
  id: string;
  user_id: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
    bio: string | null;
    rating: number | null;
    total_sales: number | null;
    region: string | null;
    city: string | null;
    is_verified: boolean | null;
  } | null;
}

export const FeaturedStoresCarousel = () => {
  const navigate = useNavigate();

  const { data: featuredStores, isLoading, error } = useQuery({
    queryKey: ['featured-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_sellers')
        .select(`
          *,
          profiles!featured_sellers_user_id_fkey (
            id,
            username,
            first_name,
            last_name,
            avatar,
            bio,
            rating,
            total_sales,
            region,
            city,
            is_verified
          )
        `)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching featured stores:', error);
        throw error;
      }

      return data as FeaturedStore[];
    },
  });

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-y border-primary/10">
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !featuredStores || featuredStores.length === 0) {
    return null;
  }

  const handleStoreClick = (storeId: string) => {
    navigate(`/user/${storeId}`);
  };

  const getDisplayName = (profile: FeaturedStore['profiles']) => {
    if (!profile) return 'Unknown Store';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    if (profile.username) return profile.username;
    return 'Unknown Store';
  };

  const getLocationString = (profile: FeaturedStore['profiles']) => {
    if (!profile) return null;
    if (profile.city && profile.region) return `${profile.city}, ${profile.region}`;
    if (profile.region) return profile.region;
    if (profile.city) return profile.city;
    return null;
  };

  const getAvatarInitial = (profile: FeaturedStore['profiles']) => {
    if (!profile) return 'S';
    if (profile.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile.username) return profile.username.charAt(0).toUpperCase();
    return 'S';
  };

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-y border-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100">
              <Crown className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Featured Stores
            </h2>
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
              <Medal className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover trusted sellers and premium stores in our marketplace
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            dragFree: true,
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {featuredStores.map((store) => {
              const profile = store.profiles;
              if (!profile) return null;

              const displayName = getDisplayName(profile);
              const location = getLocationString(profile);
              const avatarInitial = getAvatarInitial(profile);

              return (
                <CarouselItem key={store.id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card 
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-primary/5 border-primary/20 hover:border-primary/40 h-full"
                    onClick={() => handleStoreClick(profile.id)}
                  >
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      {/* Avatar */}
                      <div className="relative mx-auto mb-6">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={displayName}
                            className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto text-white font-bold text-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-lg">
                            {avatarInitial}
                          </div>
                        )}
                        
                        {/* Featured crown badge */}
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Featured
                        </div>
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {displayName}
                          </h3>
                          
                          {/* Badges */}
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {profile.is_verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {profile.total_sales && profile.total_sales >= 10 && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                <Medal className="h-3 w-3 mr-1" />
                                Pro Seller
                              </Badge>
                            )}
                          </div>

                          {/* Bio */}
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                              {profile.bio}
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-3">
                          {profile.rating && profile.rating > 0 && (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground">rating</span>
                            </div>
                          )}

                          {profile.total_sales && profile.total_sales > 0 && (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <ShoppingBag className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">{profile.total_sales}</span>
                              <span className="text-muted-foreground">sales</span>
                            </div>
                          )}

                          {location && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-1">{location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Store Button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-6 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all border-primary/20 hover:border-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoreClick(profile.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Store
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 h-12 w-12 border-primary/20 hover:bg-primary hover:text-primary-foreground" />
          <CarouselNext className="hidden sm:flex -right-4 h-12 w-12 border-primary/20 hover:bg-primary hover:text-primary-foreground" />
        </Carousel>
      </div>
    </div>
  );
};