import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, ShoppingBag, Crown, Calendar, Award } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { ItemCard } from "@/components/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/stores/listingStore";
import { generatePageTitle, generateMetaDescription } from "@/constants/seo";

interface UserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  total_sales?: number;
  region?: string;
  city?: string;
  joined_date?: string;
  is_verified?: boolean;
  achievements?: string[];
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID");
      setIsLoading(false);
      return;
    }
    
    fetchUserProfile();
    fetchUserListings();
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_public_profile', { profile_id: userId });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setError("User not found");
        return;
      }

      setProfile(data[0]);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError("Failed to load user profile");
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      });
    }
  };

  const fetchUserListings = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            first_name,
            last_name,
            username,
            avatar,
            phone_number,
            rating,
            total_sales,
            is_verified
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      toast({
        title: "Error",
        description: "Failed to load user listings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = (profile: UserProfile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || 'Anonymous User';
  };

  const getUserAvatar = (profile: UserProfile) => {
    if (profile.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (profile.username) {
      return profile.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getLocationString = (profile: UserProfile) => {
    if (profile.city && profile.region) {
      return `${profile.city}, ${profile.region}`;
    }
    if (profile.region) {
      return profile.region;
    }
    if (profile.city) {
      return profile.city;
    }
    return "Location not specified";
  };

  const isPopularSeller = (profile: UserProfile) => {
    const rating = profile.rating || 0;
    const totalSales = profile.total_sales || 0;
    const isVerified = profile.is_verified || false;
    
    return (
      (rating >= 4.5 && isVerified) ||
      totalSales >= 10 ||
      (rating >= 4.8 && totalSales >= 5)
    );
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleItemClick = (item: Listing) => {
    navigate(`/item/${item.id}`);
  };

  if (isLoading) {
    return (
      <>
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The user you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const displayName = getUserDisplayName(profile);

  return (
    <>
      <Helmet>
        <title>{generatePageTitle(`${displayName}'s Profile`)}</title>
        <meta name="description" content={generateMetaDescription(`View ${displayName}'s listings and profile on SwapBoard Ghana marketplace`)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* User Profile Header */}
          <Card className="mb-8 border border-primary/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getUserAvatar(profile)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
                        {profile.is_verified && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {isPopularSeller(profile) && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Popular Seller
                          </Badge>
                        )}
                      </div>
                      {profile.username && (
                        <p className="text-muted-foreground">@{profile.username}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      {profile.rating !== undefined && profile.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{getLocationString(profile)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Joined {formatJoinDate(profile.joined_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.total_sales || 0} successful sales</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User's Listings */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Items for Sale ({listings.length})
              </h2>
            </div>

            {listings.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No items for sale</h3>
                <p className="text-muted-foreground">
                  {displayName} doesn't have any active listings at the moment.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default UserProfile;