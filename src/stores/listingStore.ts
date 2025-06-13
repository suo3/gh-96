
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  wantedItems: string[];
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
}

interface ListingState {
  listings: Listing[];
  isLoading: boolean;
  createListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'userName' | 'userAvatar'>) => Promise<string | null>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  getAllListings: () => Promise<void>;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  isLoading: false,

  createListing: async (listingData) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: listingData.title,
          description: listingData.description,
          category: listingData.category,
          condition: listingData.condition,
          images: listingData.images,
          user_id: listingData.userId,
          location: listingData.location,
          wanted_items: listingData.wantedItems,
        })
        .select()
        .single();

      if (error) {
        console.error('Create listing error:', error);
        return null;
      }

      // Refresh listings
      await get().getAllListings();
      return data.id;
    } catch (error) {
      console.error('Create listing error:', error);
      return null;
    }
  },

  updateListing: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
        })
        .eq('id', id);

      if (!error) {
        await get().getAllListings();
      }
    } catch (error) {
      console.error('Update listing error:', error);
    }
  },

  deleteListing: async (id) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (!error) {
        set(state => ({
          listings: state.listings.filter(listing => listing.id !== id)
        }));
      }
    } catch (error) {
      console.error('Delete listing error:', error);
    }
  },

  markAsCompleted: async (id) => {
    await get().updateListing(id, { status: 'completed' });
  },

  getUserListings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            username,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get user listings error:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        condition: item.condition,
        images: item.images || [],
        userId: item.user_id,
        userName: item.profiles?.username || 'Anonymous',
        userAvatar: item.profiles?.avatar || 'U',
        location: item.location || '',
        wantedItems: item.wanted_items || [],
        status: item.status as 'active' | 'completed' | 'paused',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        views: item.views || 0,
        likes: item.likes || 0,
      }));
    } catch (error) {
      console.error('Get user listings error:', error);
      return [];
    }
  },

  getAllListings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            username,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get all listings error:', error);
        return;
      }

      const listings = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        condition: item.condition,
        images: item.images || [],
        userId: item.user_id,
        userName: item.profiles?.username || 'Anonymous',
        userAvatar: item.profiles?.avatar || 'U',
        location: item.location || '',
        wantedItems: item.wanted_items || [],
        status: item.status as 'active' | 'completed' | 'paused',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        views: item.views || 0,
        likes: item.likes || 0,
      }));

      set({ listings });
    } catch (error) {
      console.error('Get all listings error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
