import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { Listing } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { generatePageTitle, generateMetaDescription } from "@/constants/seo";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          created_at,
          listing_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setFavorites([]);
        return;
      }

      // Fetch the actual listings
      const listingIds = data.map(fav => fav.listing_id);
      
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            first_name,
            last_name,
            username,
            avatar,
            phone_number
          )
        `)
        .in('id', listingIds)
        .eq('status', 'active');

      if (listingsError) throw listingsError;

      setFavorites(listingsData || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load your favorites.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: Listing) => {
    navigate(`/item/${item.id}`);
  };

  const handleRemoveFromFavorites = async (item: Listing) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', item.id);

      if (error) throw error;

      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.id !== item.id));
      
      toast({
        title: "Removed from Favorites",
        description: "Item removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from favorites.",
        variant: "destructive",
      });
    }
  };

  const onStartConversation = (item: Listing) => {
    navigate(`/messages?item=${item.id}`);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Helmet>
        <title>{generatePageTitle("My Favorites")}</title>
        <meta name="description" content={generateMetaDescription("View and manage your favorite items on SwapBoard Ghana marketplace")} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mr-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Heart className="w-8 h-8 mr-3 text-red-500 fill-current" />
                  My Favorites
                </h1>
                <p className="text-muted-foreground mt-1">
                  {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your favorites...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && favorites.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start exploring the marketplace and save items you're interested in by clicking the heart icon.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Marketplace
              </Button>
            </div>
          )}

          {/* Favorites Grid */}
          {!isLoading && favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                  onItemLike={handleRemoveFromFavorites}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Favorites;