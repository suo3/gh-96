import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

export interface SwapRequest {
  id: string;
  item1Id: string;
  item1Title: string;
  item2Id: string;
  item2Title: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface SwapState {
  swaps: SwapRequest[];
  isLoading: boolean;
  error: string | null;
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  fetchUserSwaps: (userId: string) => Promise<void>;
  updateSwapStatus: (swapId: string, status: SwapRequest['status']) => Promise<boolean>;
}

export const useSwapStore = create<SwapState>()((set, get) => ({
  swaps: [],
  isLoading: false,
  error: null,

  createSwapRequest: async (request) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user has enough coins
      const { canMakeSwap, spendCoins } = useAuthStore.getState();
      if (!canMakeSwap()) {
        set({ error: 'Insufficient coins to make swap. You need 2 coins.', isLoading: false });
        return false;
      }

      // Spend the coins first
      const coinSpent = await spendCoins(2, 'Initiated swap: ' + request.item1Title + ' for ' + request.item2Title);
      if (!coinSpent) {
        set({ error: 'Failed to deduct coins. Please try again.', isLoading: false });
        return false;
      }

      const { data, error } = await supabase
        .from('swaps')
        .insert([
          {
            item1_id: request.item1Id,
            item1_title: request.item1Title,
            item2_id: request.item2Id,
            item2_title: request.item2Title,
            user1_id: request.user1Id,
            user2_id: request.user2Id,
            status: request.status,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating swap request:', error);
        set({ error: error.message, isLoading: false });
        return false;
      }

      const newSwap: SwapRequest = {
        id: data.id,
        item1Id: data.item1_id,
        item1Title: data.item1_title,
        item2Id: data.item2_id,
        item2Title: data.item2_title,
        user1Id: data.user1_id,
        user2Id: data.user2_id,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set(state => ({
        swaps: [newSwap, ...state.swaps],
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Error in createSwapRequest:', error);
      set({ error: 'Failed to create swap request', isLoading: false });
      return false;
    }
  },

  fetchUserSwaps: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('swaps')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching swaps:', error);
        set({ error: error.message, isLoading: false });
        return;
      }

      const fetchedSwaps: SwapRequest[] = data.map(swap => ({
        id: swap.id,
        item1Id: swap.item1_id,
        item1Title: swap.item1_title,
        item2Id: swap.item2_id,
        item2Title: swap.item2_title,
        user1Id: swap.user1_id,
        user2Id: swap.user2_id,
        status: swap.status,
        createdAt: new Date(swap.created_at),
        updatedAt: new Date(swap.updated_at),
      }));

      set({ swaps: fetchedSwaps, isLoading: false, error: null });
    } catch (error) {
      console.error('Error in fetchUserSwaps:', error);
      set({ error: 'Failed to fetch swaps', isLoading: false });
    }
  },

  updateSwapStatus: async (swapId: string, status: SwapRequest['status']) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('swaps')
        .update({ status })
        .eq('id', swapId)
        .select()
        .single();

      if (error) {
        console.error('Error updating swap status:', error);
        set({ error: error.message, isLoading: false });
        return false;
      }

      set(state => ({
        swaps: state.swaps.map(swap => swap.id === swapId ? { ...swap, status } : swap),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Error in updateSwapStatus:', error);
      set({ error: 'Failed to update swap status', isLoading: false });
      return false;
    }
  },
}));
