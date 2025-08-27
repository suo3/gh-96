import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface UserStats {
  activeListings: number;
  totalViews: number;
  totalSales: number;
  monthlyListings: number;
  monthlySales: number;
  loading: boolean;
  error: string | null;
}

export const useUserStats = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    activeListings: 0,
    totalViews: 0,
    totalSales: 0,
    monthlyListings: 0,
    monthlySales: 0,
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

        // Get total sales count
        const { count: salesCount, error: salesError } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq('status', 'completed');

        if (salesError) throw salesError;

        // Get monthly stats (current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { count: monthlyListingsCount, error: monthlyListingsError } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        if (monthlyListingsError) throw monthlyListingsError;

        const { count: monthlySalesCount, error: monthlySalesError } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq('status', 'completed')
          .gte('created_at', startOfMonth.toISOString());

        if (monthlySalesError) throw monthlySalesError;

        setStats({
          activeListings: listingsCount || 0,
          totalViews,
          totalSales: salesCount || 0,
          monthlyListings: monthlyListingsCount || 0,
          monthlySales: monthlySalesCount || 0,
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