
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRatingStore } from '@/stores/ratingStore';
import { useAuthStore } from '@/stores/authStore';

export const useRealtimeRatings = () => {
  const { fetchAllUserRatings } = useRatingStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to ratings table changes
    const ratingsChannel = supabase
      .channel('ratings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          console.log('Ratings real-time update:', payload);
          // Refresh all user ratings when ratings change
          fetchAllUserRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ratingsChannel);
    };
  }, [isAuthenticated, fetchAllUserRatings]);
};
