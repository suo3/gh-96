import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Users, Medal, MapPin, ShoppingBag, Award, Crown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRatingDisplay } from "@/components/UserRatingDisplay";
import defaultProfile1 from "@/assets/default-profile-1.jpg";
import defaultProfile2 from "@/assets/default-profile-2.jpg";
import defaultProfile3 from "@/assets/default-profile-3.jpg";
import defaultProfile4 from "@/assets/default-profile-4.jpg";

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
    profile_image_url: string | null;
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

  // Array of default Ghana-inspired profile images
  const defaultProfiles = [defaultProfile1, defaultProfile2, defaultProfile3, defaultProfile4];

  const getDefaultProfileImage = (userId: string) => {
    // Use a simple hash of the user ID to consistently assign the same default image
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % defaultProfiles.length;
    return defaultProfiles[index];
  };

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
            profile_image_url,
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
    <div className="w-full bg-emerald-600  border-y border-primary/10">
      <div className="container mx-auto px-4 py-6">
        <div hidden className="text-left mb-1">
          <h2 className="text-xl  font-semibold text-foreground mb-2">Featured Stores</h2>
          <p className="text-sm text-muted-foreground">
            Discover trusted sellers in our marketplace
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
          <CarouselContent className="-ml-2">
            {featuredStores.map((store) => {
              const profile = store.profiles;
              if (!profile) return null;

              const displayName = getDisplayName(profile);
              const avatarInitial = getAvatarInitial(profile);

              return (
                <CarouselItem key={store.id} className="pl-2 basis-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto flex ml-8 items-center  gap-2 px-3 py-2 bg-white border-black hover:bg-primary/5 hover:border-primary/50 ttransition-all"
                    onClick={() => handleStoreClick(profile.id)}
                  >
                    <img
                    hidden={!profile.profile_image_url}
                      src={profile.profile_image_url || profile.avatar || getDefaultProfileImage(profile.id)}
                      alt={displayName}
                      className="w-8 h-8 rounded-full border-black/50 border object-cover"
                    />
                   <div className={`w-8 h-8 rounded-full bg-muted flex  hover:color-black items-center justify-center text-medium font-semibold ${profile.profile_image_url ? 'hidden' : ''}`}>
                      {avatarInitial}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm font-medium">{displayName}</span>
                      <UserRatingDisplay userId={profile.id} size="sm" />
                    </div>
                    {profile.is_verified && (
                      <Award className="h-3 w-3 text-blue-500" />
                    )}
                  </Button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-2 h-8 w-8 color-black" />
          <CarouselNext className="hidden sm:flex -right-2 h-8 w-8" />
        </Carousel>
      </div>
    </div>
  );
};