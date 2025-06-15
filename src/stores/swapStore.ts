
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Swap {
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  color: string;
}

interface SwapState {
  swaps: Swap[];
  achievements: Achievement[];
  isLoading: boolean;
  fetchUserSwaps: () => Promise<void>;
  generateAchievements: (swaps: Swap[], totalSwaps: number) => Achievement[];
}

export const useSwapStore = create<SwapState>((set, get) => ({
  swaps: [],
  achievements: [],
  isLoading: false,

  fetchUserSwaps: async () => {
    try {
      set({ isLoading: true });
      
      const { data: swaps, error } = await supabase
        .from('swaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swaps:', error);
        return;
      }

      // Type the data properly by casting the status field
      const typedSwaps: Swap[] = (swaps || []).map(swap => ({
        ...swap,
        status: swap.status as 'pending' | 'completed' | 'cancelled'
      }));

      const achievements = get().generateAchievements(typedSwaps, typedSwaps.length);
      set({ swaps: typedSwaps, achievements });
    } catch (error) {
      console.error('Error fetching user swaps:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateAchievements: (swaps: Swap[], totalSwaps: number) => {
    const achievements: Achievement[] = [];

    // First Swap Achievement
    if (totalSwaps >= 1) {
      achievements.push({
        id: 'first-swap',
        title: 'First Swap',
        description: 'Welcome to the community!',
        icon: 'Award',
        unlockedAt: new Date(swaps[swaps.length - 1]?.created_at || Date.now()),
        color: 'emerald'
      });
    }

    // 10 Swaps Achievement
    if (totalSwaps >= 10) {
      achievements.push({
        id: '10-swaps',
        title: '10 Swaps',
        description: 'Active swapper',
        icon: 'RotateCcw',
        unlockedAt: new Date(swaps[swaps.length - 10]?.created_at || Date.now()),
        color: 'blue'
      });
    }

    // Could add more achievements based on other criteria
    // For now, we'll add a 5-star rating achievement as a placeholder
    achievements.push({
      id: '5-star-rating',
      title: '5 Star Rating',
      description: 'Excellent reputation',
      icon: 'Star',
      unlockedAt: new Date(),
      color: 'yellow'
    });

    return achievements;
  }
}));
