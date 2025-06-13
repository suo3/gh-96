
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  category: string;
  condition: string;
  images?: string[];
  user_id: string;
  location?: string;
  wanted_items?: string[];
  status?: string;
  views?: number;
  likes?: number;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    username?: string;
    avatar?: string;
    first_name?: string;
    last_name?: string;
  };
  hasActiveMessage?: boolean; // Track if user has initiated a message for this item
}

interface ListingStore {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  selectedCondition: string;
  sortBy: string;
  swapFilter: 'all' | 'swapped' | 'unswapped';
  
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedCondition: (condition: string) => void;
  setSortBy: (sort: string) => void;
  setSwapFilter: (filter: 'all' | 'swapped' | 'unswapped') => void;
  fetchListings: () => Promise<void>;
  fetchUserListings: (userId: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  createListing: (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  markItemAsMessaged: (itemId: string) => void;
  filteredListings: () => Listing[];
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  selectedCondition: '',
  sortBy: 'newest',
  swapFilter: 'all',

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSwapFilter: (filter) => set({ swapFilter: filter }),

  fetchListings: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ listings: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ error: 'Failed to fetch listings', loading: false });
    }
  },

  fetchUserListings: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ listings: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching user listings:', error);
      set({ error: 'Failed to fetch user listings', loading: false });
    }
  },

  getUserListings: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user listings:', error);
      return [];
    }
  },

  createListing: async (listing) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        listings: [data, ...state.listings],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating listing:', error);
      set({ error: 'Failed to create listing', loading: false });
    }
  },

  updateListing: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        listings: state.listings.map((listing) =>
          listing.id === id ? { ...listing, ...data } : listing
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating listing:', error);
      set({ error: 'Failed to update listing', loading: false });
    }
  },

  deleteListing: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        listings: state.listings.filter((listing) => listing.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting listing:', error);
      set({ error: 'Failed to delete listing', loading: false });
    }
  },

  markAsCompleted: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        listings: state.listings.map((listing) =>
          listing.id === id ? { ...listing, status: 'completed' } : listing
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error marking listing as completed:', error);
      set({ error: 'Failed to mark listing as completed', loading: false });
    }
  },

  markItemAsMessaged: (itemId: string) => {
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === itemId ? { ...listing, hasActiveMessage: true } : listing
      )
    }));
  },

  filteredListings: () => {
    const { listings, searchTerm, selectedCategory, selectedCondition, sortBy, swapFilter } = get();
    
    let filtered = [...listings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.wanted_items?.some(item => 
          item.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((listing) => listing.category === selectedCategory);
    }

    // Apply condition filter
    if (selectedCondition) {
      filtered = filtered.filter((listing) => listing.condition === selectedCondition);
    }

    // Apply swap filter
    if (swapFilter === 'swapped') {
      filtered = filtered.filter((listing) => listing.hasActiveMessage === true);
    } else if (swapFilter === 'unswapped') {
      filtered = filtered.filter((listing) => !listing.hasActiveMessage);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    return filtered;
  },
}));
