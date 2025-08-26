import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  const fetchUserFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data?.map(fav => fav.listing_id) || []);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const isFavorited = favoriteIds.has(listingId);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;

        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });

        toast({
          title: "Removed from Favorites",
          description: "Item removed from your favorites.",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });

        if (error) throw error;

        setFavoriteIds(prev => new Set([...prev, listingId]));

        toast({
          title: "Added to Favorites",
          description: "Item saved to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorited = (listingId: string) => favoriteIds.has(listingId);

  return {
    favoriteIds,
    isFavorited,
    toggleFavorite,
    isLoading
  };
};