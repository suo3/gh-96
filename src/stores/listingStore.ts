
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
  location: string;
  wantedItems: string[];
  status: 'active' | 'completed' | 'paused';
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ListingState {
  listings: Listing[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  fetchListings: () => Promise<void>;
  createListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  markAsCompleted: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: '',

  fetchListings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            username,
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const listings: Listing[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        images: item.images || [],
        userId: item.user_id,
        location: item.location,
        wantedItems: item.wanted_items || [],
        status: item.status,
        views: item.views,
        likes: item.likes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      set({ listings, isLoading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ isLoading: false });
    }
  },

  createListing: async (listing) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          title: listing.title,
          description: listing.description,
          category: listing.category,
          condition: listing.condition,
          images: listing.images,
          user_id: listing.userId,
          location: listing.location,
          wanted_items: listing.wantedItems,
          status: listing.status
        }])
        .select()
        .single();

      if (error) throw error;

      await get().fetchListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  updateListing: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          condition: updates.condition,
          images: updates.images,
          location: updates.location,
          wanted_items: updates.wantedItems,
          status: updates.status
        })
        .eq('id', id);

      if (error) throw error;

      await get().fetchListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  deleteListing: async (id) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

  getUserListings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        images: item.images || [],
        userId: item.user_id,
        location: item.location,
        wantedItems: item.wanted_items || [],
        status: item.status,
        views: item.views,
        likes: item.likes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching user listings:', error);
      return [];
    }
  },

  markAsCompleted: async (id) => {
    await get().updateListing(id, { status: 'completed' });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category })
}));
