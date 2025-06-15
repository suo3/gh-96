
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

export interface PendingSwap {
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

interface SwapState {
  swaps: Swap[];
  pendingSwaps: PendingSwap[];
  achievements: Achievement[];
  isLoading: boolean;
  fetchUserSwaps: (userId: string) => Promise<void>;
  generateAchievements: (totalSwaps: number, totalPending: number) => Achievement[];
  saveAchievementsToProfile: (userId: string, achievements: Achievement[]) => Promise<void>;
}

export const useSwapStore = create<SwapState>((set, get) => ({
  swaps: [],
  pendingSwaps: [],
  achievements: [],
  isLoading: false,

  fetchUserSwaps: async (userId: string) => {
    try {
      set({ isLoading: true });
      
      // Fetch completed swaps where the user is either user1 or user2
      const { data: swaps, error: swapsError } = await supabase
        .from('swaps')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (swapsError) {
        console.error('Error fetching swaps:', swapsError);
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

      // Type the swaps data properly
      const typedSwaps: Swap[] = (swaps || []).map(swap => ({
        ...swap,
        status: swap.status as 'pending' | 'completed' | 'cancelled'
      }));

      // Convert conversations to pending swaps
      const pendingSwaps: PendingSwap[] = (conversations || []).map(conv => ({
        id: conv.id,
        item_title: conv.item_title || 'Unknown Item',
        user1_id: conv.user1_id,
        user2_id: conv.user2_id,
        status: 'pending' as const,
        created_at: conv.created_at || new Date().toISOString(),
        updated_at: conv.updated_at || new Date().toISOString()
      }));

      console.log('Fetched swaps:', typedSwaps);
      console.log('Fetched pending swaps from conversations:', pendingSwaps);

      // Generate achievements based on total activity
      const totalActivity = typedSwaps.length + pendingSwaps.length;
      const achievements = get().generateAchievements(typedSwaps.length, totalActivity);
      
      // Save achievements to user profile
      await get().saveAchievementsToProfile(userId, achievements);

      set({ 
        swaps: typedSwaps, 
        pendingSwaps: pendingSwaps,
        achievements 
      });
    } catch (error) {
      console.error('Error fetching user swaps:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  generateAchievements: (completedSwaps: number, totalActivity: number) => {
    const achievements: Achievement[] = [];

    // First Activity Achievement (includes conversations)
    if (totalActivity >= 1) {
      achievements.push({
        id: 'first-activity',
        title: 'First Swap Attempt',
        description: 'Welcome to the community!',
        icon: 'Award',
        unlockedAt: new Date(),
        color: 'emerald'
      });
    }

    // First Completed Swap Achievement
    if (completedSwaps >= 1) {
      achievements.push({
        id: 'first-swap',
        title: 'First Completed Swap',
        description: 'Successfully completed your first swap!',
        icon: 'RotateCcw',
        unlockedAt: new Date(),
        color: 'blue'
      });
    }

    // 5 Activities Achievement
    if (totalActivity >= 5) {
      achievements.push({
        id: '5-activities',
        title: '5 Swap Activities',
        description: 'Getting active in the community!',
        icon: 'Star',
        unlockedAt: new Date(),
        color: 'yellow'
      });
    }

    // 5 Completed Swaps Achievement
    if (completedSwaps >= 5) {
      achievements.push({
        id: '5-swaps',
        title: '5 Completed Swaps',
        description: 'Experienced swapper!',
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
