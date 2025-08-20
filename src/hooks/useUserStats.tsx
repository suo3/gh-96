import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface UserStats {
  activeListings: number;
  totalViews: number;
  totalSwaps: number;
  monthlyListings: number;
  monthlySwaps: number;
  loading: boolean;
  error: string | null;
}

export const useUserStats = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    activeListings: 0,
    totalViews: 0,
    totalSwaps: 0,
    monthlyListings: 0,
    monthlySwaps: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Get active listings count
        const { count: listingsCount, error: listingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (listingsError) throw listingsError;

        // Get total views from all user's listings
        const { data: viewsData, error: viewsError } = await supabase
          .from('listings')
          .select('views')
          .eq('user_id', user.id);

        if (viewsError) throw viewsError;

        const totalViews = viewsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;

        // Get total swaps count
        const { count: swapsCount, error: swapsError } = await supabase
          .from('swaps')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq('status', 'completed');

        if (swapsError) throw swapsError;

        // Get monthly stats (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { count: monthlyListingsCount, error: monthlyListingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (monthlyListingsError) throw monthlyListingsError;

        const { count: monthlySwapsCount, error: monthlySwapsError } = await supabase
          .from('swaps')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq('status', 'completed')
          .gte('created_at', startOfMonth.toISOString());

        if (monthlySwapsError) throw monthlySwapsError;

        setStats({
          activeListings: listingsCount || 0,
          totalViews,
          totalSwaps: swapsCount || 0,
          monthlyListings: monthlyListingsCount || 0,
          monthlySwaps: monthlySwapsCount || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load user statistics'
        }));
      }
    };

    fetchStats();
  }, [user?.id]);

  return stats;
};