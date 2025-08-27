
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Sale {
  id: string;
  item1_id: string | null;
  item2_id: string | null;
  user1_id: string;
  user2_id: string;
  item1_title: string;
  item2_title: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PendingSale {
  id: string;
  item_title: string;
  user1_id: string;
  user2_id: string;
  status: 'pending';
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  color: string;
}

interface SaleState {
  sales: Sale[];
  pendingSales: PendingSale[];
  achievements: Achievement[];
  isLoading: boolean;
  fetchUserSales: (userId: string) => Promise<void>;
  generateAchievements: (totalSales: number, totalPending: number) => Achievement[];
  saveAchievementsToProfile: (userId: string, achievements: Achievement[]) => Promise<void>;
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  pendingSales: [],
  achievements: [],
  isLoading: false,

  fetchUserSales: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      // Fetch completed sales where the user is either user1 or user2
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      }

      // Fetch pending conversations (representing pending swaps)
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
      }

      // Type the sales data properly
      const typedSales: Sale[] = (sales || []).map(sale => ({
        ...sale,
        status: sale.status as 'pending' | 'completed' | 'cancelled'
      }));

      // Convert conversations to pending sales
      const pendingSales: PendingSale[] = (conversations || []).map(conv => ({
        id: conv.id,
        item_title: conv.item_title || 'Unknown Item',
        user1_id: conv.user1_id,
        user2_id: conv.user2_id,
        status: 'pending' as const,
        created_at: conv.created_at || new Date().toISOString(),
        updated_at: conv.updated_at || new Date().toISOString()
      }));

      console.log('Fetched sales:', typedSales);
      console.log('Fetched pending sales from conversations:', pendingSales);

      // Generate achievements based on total activity
      const totalActivity = typedSales.length + pendingSales.length;
      const achievements = get().generateAchievements(typedSales.length, totalActivity);
      
      // Save achievements to user profile
      await get().saveAchievementsToProfile(userId, achievements);

      set({ 
        sales: typedSales, 
        pendingSales: pendingSales,
        achievements 
      });
    } catch (error) {
      console.error('Error fetching user sales:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateAchievements: (completedSales: number, totalActivity: number) => {
    const achievements: Achievement[] = [];

    // First Activity Achievement (includes conversations)
    if (totalActivity >= 1) {
      achievements.push({
        id: 'first-activity',
        title: 'First Sale Attempt',
        description: 'Welcome to the community!',
        icon: 'Award',
        unlockedAt: new Date(),
        color: 'emerald'
      });
    }

    // First Completed Sale Achievement
    if (completedSales >= 1) {
      achievements.push({
        id: 'first-sale',
        title: 'First Completed Sale',
        description: 'Successfully completed your first sale!',
        icon: 'ShoppingBag',
        unlockedAt: new Date(),
        color: 'blue'
      });
    }

    // 5 Activities Achievement
    if (totalActivity >= 5) {
      achievements.push({
        id: '5-activities',
        title: '5 Sale Activities',
        description: 'Getting active in the community!',
        icon: 'Star',
        unlockedAt: new Date(),
        color: 'yellow'
      });
    }

    // 5 Completed Sales Achievement
    if (completedSales >= 5) {
      achievements.push({
        id: '5-sales',
        title: '5 Completed Sales',
        description: 'Experienced seller!',
        icon: 'Star',
        unlockedAt: new Date(),
        color: 'yellow'
      });
    }

    return achievements;
  },

  saveAchievementsToProfile: async (userId: string, achievements: Achievement[]) => {
    try {
      const achievementIds = achievements.map(a => a.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ achievements: achievementIds })
        .eq('id', userId);

      if (error) {
        console.error('Error saving achievements:', error);
      }
    } catch (error) {
      console.error('Error saving achievements to profile:', error);
    }
  }
}));
