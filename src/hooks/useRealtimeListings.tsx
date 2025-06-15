
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useListingStore } from '@/stores/listingStore';
import { useAuthStore } from '@/stores/authStore';

export const useRealtimeListings = () => {
  const { fetchListings } = useListingStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Subscribe to listings table changes
    const listingsChannel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          console.log('Listings real-time update:', payload);
          // Refresh listings when any change occurs
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
    };
  }, [fetchListings]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to profiles table changes (for user ratings, etc.)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profiles real-time update:', payload);
          // Refresh listings to get updated profile data
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, [isAuthenticated, fetchListings]);
};
