
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRatingStore } from '@/stores/ratingStore';
import { useAuthStore } from '@/stores/authStore';

export const useRealtimeRatings = () => {
  const { userRatings } = useRatingStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

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
          // Clear the user ratings cache to force a refresh on next access
          // Since we don't have fetchAllUserRatings, we'll let individual components
          // refetch as needed when they access getUserRatings
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ratingsChannel);
    };
  }, [isAuthenticated, user?.id]);
};
