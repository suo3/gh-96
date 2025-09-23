import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Award, MapPin, ShoppingBag, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UserRatingDisplay } from "./UserRatingDisplay";
import kentePattern from "@/assets/kente-pattern.jpg";
import defaultProfile1 from "@/assets/default-profile-1.jpg";
import defaultProfile2 from "@/assets/default-profile-2.jpg";
import defaultProfile3 from "@/assets/default-profile-3.jpg";
import defaultProfile4 from "@/assets/default-profile-4.jpg";

interface FeaturedStore {
  id: string;
  user_id: string;
  position: number;
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

export const FeaturedStoresSpotlight = () => {
  const navigate = useNavigate();
  
  // Array of default Ghana-inspired profile images
  const defaultProfiles = [defaultProfile1, defaultProfile2, defaultProfile3, defaultProfile4];

  const { data: featuredStores, isLoading } = useQuery({
    queryKey: ['featured-stores-spotlight'],
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

      if (error) throw error;
      return data as FeaturedStore[];
    },
  });

  const handleStoreClick = (storeId: string) => {
    navigate(`/user/${storeId}`);
  };

  const getDisplayName = (profile: FeaturedStore['profiles']) => {
    if (!profile) return 'Unknown User';
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    if (profile.username) return profile.username;
    return 'Unknown User';
  };

  const getLocationString = (profile: FeaturedStore['profiles']) => {
    if (!profile) return null;
    if (profile.city && profile.region) return `${profile.city}, ${profile.region}`;
    if (profile.region) return profile.region;
    if (profile.city) return profile.city;
    return null;
  };

  const getDefaultProfileImage = (userId: string) => {
    // Use a simple hash of the user ID to consistently assign the same default image
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % defaultProfiles.length;
    return defaultProfiles[index];
  };
  
  const getAvatarInitial = (profile: FeaturedStore['profiles']) => {
    if (!profile) return 'U';
    if (profile.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile.username) return profile.username.charAt(0).toUpperCase();
    return 'U';
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] lg:h-[500px] xl:h-[600px] animate-pulse">
        <div className="bg-muted rounded-2xl w-full h-full"></div>
      </div>
    );
  }

  if (!featuredStores || featuredStores.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      <Carousel className="w-full max-w-2xl">
        <CarouselContent>
          {featuredStores.map((store) => {
            const profile = store.profiles;
            if (!profile) return null;

            const displayName = getDisplayName(profile);
            const avatarInitial = getAvatarInitial(profile);
            const backgroundImage = profile.profile_image_url || getDefaultProfileImage(profile.id);

            return (
              <CarouselItem key={store.id} className="basis-1/2 md:basis-1/3">
                <div className="p-4">
                  <Card 
                    className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 group border-0 shadow-lg bg-transparent backdrop-blur-sm rounded-full w-48 h-48 mx-auto"
                    onClick={() => handleStoreClick(profile.id)}
                  >
                    {/* Background Image */}
                    <div 
                    hidden={!backgroundImage}
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-full"
                      style={{ 
                        backgroundImage: `url(${backgroundImage})` 
                      }}
                    /> 
                      
                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute border border-white inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-full" />
                    
                    <div className="relative z-10 h-full flex flex-col justify-end items-center text-center p-4 pb-6">
                      <div className="space-y-1">
                        <div 
                    hidden={!!backgroundImage}
                      className="absolute text-8xl text-white text-center  inset-0 bg-cover bg-center bg-no-repeat rounded-full"       
                    >{avatarInitial} </div>
                        <h3 className="font-bold text-white text-sm leading-tight">
                          {displayName}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-xs text-white/80">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {(profile.rating || 0).toFixed(1)}
                          </span>
                          <span>{profile.total_sales || 0} sales</span>
                        </div>
                        {profile.is_verified && (
                          <Badge variant="secondary" className="bg-primary/80 text-white border-0 text-xs">
                            <Award className="w-2 h-2 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <CarouselPrevious className="left-4 -ml-1 z-200" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};