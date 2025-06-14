
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Rating {
  id: string;
  ratedUserId: string;
  ratedUserName: string;
  raterUserId: string;
  raterUserName: string;
  rating: number;
  comment: string;
  itemTitle: string;
  createdAt: Date;
}

interface RatingState {
  ratings: Rating[];
  userRatings: { [userId: string]: Rating[] };
  loading: boolean;
  addRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => Promise<void>;
  getUserRatings: (userId: string) => Promise<Rating[]>;
  getAverageRating: (userId: string) => number;
  fetchUserRatings: (userId: string) => Promise<void>;
}

export const useRatingStore = create<RatingState>((set, get) => ({
  ratings: [],
  userRatings: {},
  loading: false,
  
  addRating: async (newRating) => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          rated_user_id: newRating.ratedUserId,
          rater_user_id: newRating.raterUserId,
          rating: newRating.rating,
          comment: newRating.comment,
          item_title: newRating.itemTitle
        })
        .select()
        .single();

      if (error) throw error;

      const rating: Rating = {
        id: data.id,
        ratedUserId: data.rated_user_id,
        ratedUserName: newRating.ratedUserName,
        raterUserId: data.rater_user_id,
        raterUserName: newRating.raterUserName,
        rating: data.rating,
        comment: data.comment || '',
        itemTitle: data.item_title || '',
        createdAt: new Date(data.created_at)
      };

      set((state) => ({
        ratings: [...state.ratings, rating]
      }));

      // Update user ratings cache
      const { userRatings } = get();
      const existingRatings = userRatings[newRating.ratedUserId] || [];
      set((state) => ({
        userRatings: {
          ...state.userRatings,
          [newRating.ratedUserId]: [...existingRatings, rating]
        }
      }));
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  },
  
  fetchUserRatings: async (userId: string) => {
    const { userRatings } = get();
    
    // Return cached ratings if available
    if (userRatings[userId]) {
      return;
    }

    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater_profile:profiles!ratings_rater_user_id_fkey(first_name, last_name, username)
        `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ratings: Rating[] = (data || []).map(item => {
        const raterProfile = item.rater_profile as any;
        return {
          id: item.id,
          ratedUserId: item.rated_user_id,
          ratedUserName: '', // We don't need this for display
          raterUserId: item.rater_user_id,
          raterUserName: raterProfile 
            ? `${raterProfile.first_name || ''} ${raterProfile.last_name || ''}`.trim() || raterProfile.username || 'Anonymous'
            : 'Anonymous',
          rating: item.rating,
          comment: item.comment || '',
          itemTitle: item.item_title || '',
          createdAt: new Date(item.created_at)
        };
      });

      set((state) => ({
        userRatings: {
          ...state.userRatings,
          [userId]: ratings
        },
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      set({ loading: false });
    }
  },

  getUserRatings: async (userId: string) => {
    const { userRatings } = get();
    
    // Return cached ratings if available
    if (userRatings[userId]) {
      return userRatings[userId];
    }

    // Fetch if not cached
    await get().fetchUserRatings(userId);
    return get().userRatings[userId] || [];
  },
  
  getAverageRating: (userId: string) => {
    const { userRatings } = get();
    const ratings = userRatings[userId] || [];
    
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }
}));
