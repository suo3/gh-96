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
    <div className="relative w-full h-[400px] lg:h-[500px] xl:h-[600px]">
      <Carousel className="w-full h-full">
        <CarouselContent>
          {featuredStores.map((store) => {
            const profile = store.profiles;
            if (!profile) return null;

            const displayName = getDisplayName(profile);
            const location = getLocationString(profile);
            const avatarInitial = getAvatarInitial(profile);

            return (
              <CarouselItem key={store.id}>
                <Card className="h-[400px] lg:h-[500px] xl:h-[600px] relative overflow-hidden border-0 shadow-2xl">
                  {/* Kente pattern background */}
                  <div 
                    className="absolute inset-0 opacity-70"
                    style={{
                      backgroundImage: `url(${kentePattern})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/40 to-background/30"></div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <Badge className="bg-amber-500/90 text-white border-amber-400/50 backdrop-blur-sm">
                        <Award className="w-3 h-3 mr-1" />
                        Featured Store
                      </Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        #{store.position}
                      </div>
                    </div>

                    {/* Store info */}
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                      <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                        <AvatarImage src={profile.avatar || undefined} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-2xl font-bold">{displayName}</h3>
                          {profile.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        {profile.bio && (
                          <p className="text-muted-foreground text-sm max-w-md mx-auto line-clamp-2">
                            {profile.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-center gap-4 text-sm">
                          <UserRatingDisplay userId={profile.id} showCount size="sm" />
                          
                          {profile.total_sales && profile.total_sales > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ShoppingBag className="h-4 w-4" />
                              <span>{profile.total_sales} sales</span>
                            </div>
                          )}
                          
                          {location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex justify-center">
                      <Button 
                        onClick={() => handleStoreClick(profile.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Visit Store
                      </Button>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};