
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  wanted_items: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  likes?: number;
  views?: number;
  status?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar?: string;
  };
  hasActiveMessage?: boolean;
}

interface ListingStore {
  listings: Listing[];
  userListings: Listing[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  selectedLocation: string;
  selectedCondition: string;
  priceRange: [number, number];
  sortBy: string;
  viewMode: 'grid' | 'list';
  minRating: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateListing: (id: string, listing: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  incrementLikes: (id: string) => Promise<void>;
  
  // Filters
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedLocation: (location: string) => void;
  setSelectedCondition: (condition: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sortBy: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setMinRating: (rating: number) => void;
  clearFilters: () => void;
  
  // Computed
  getFilteredListings: () => Listing[];
  
  // New method for conversation tracking
  updateListingConversationStatus: (listingId: string, hasActiveMessage: boolean) => void;
  checkAndUpdateConversationStatuses: () => Promise<void>;
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  userListings: [],
  categories: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Music', 'Vehicles', 'Other'],
  selectedCategory: '',
  searchQuery: '',
  selectedLocation: '',
  selectedCondition: '',
  priceRange: [0, 1000],
  sortBy: 'recent',
  viewMode: 'grid',
  minRating: 0,
  isLoading: false,
  error: null,

  setListings: (listings) => set({ listings }),

  addListing: async (listing) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          ...listing,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        listings: [data, ...state.listings],
        userListings: [data, ...state.userListings],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding listing:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add listing', isLoading: false });
      throw error;
    }
  },

  updateListing: async (id, updatedListing) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updatedListing)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        listings: state.listings.map(listing => 
          listing.id === id ? { ...listing, ...data } : listing
        ),
        userListings: state.userListings.map(listing => 
          listing.id === id ? { ...listing, ...data } : listing
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating listing:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update listing', isLoading: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        listings: state.listings.filter(listing => listing.id !== id),
        userListings: state.userListings.filter(listing => listing.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting listing:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete listing', isLoading: false });
      throw error;
    }
  },

  fetchListings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            first_name,
            last_name,
            username,
            avatar
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check conversation status for each listing
      const listingsWithConversationStatus = await Promise.all(
        (data || []).map(async (listing) => {
          try {
            const { data: hasConversation } = await supabase
              .rpc('listing_has_active_conversation', { listing_uuid: listing.id });
            
            return {
              ...listing,
              hasActiveMessage: hasConversation || false
            };
          } catch (error) {
            console.error(`Error checking conversation for listing ${listing.id}:`, error);
            return {
              ...listing,
              hasActiveMessage: false
            };
          }
        })
      );

      set({ 
        listings: listingsWithConversationStatus,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch listings', 
        isLoading: false 
      });
    }
  },

  fetchUserListings: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.user) return;

    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        userListings: data || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching user listings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user listings', 
        isLoading: false 
      });
    }
  },

  incrementViews: async (id) => {
    try {
      const { error } = await supabase.rpc('increment_listing_views', { listing_id: id });
      
      if (error) {
        console.error('Error incrementing views:', error);
        return;
      }

      // Update local state
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, views: (listing.views || 0) + 1 }
            : listing
        )
      }));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  incrementLikes: async (id) => {
    try {
      const { error } = await supabase.rpc('increment_listing_likes', { listing_id: id });
      
      if (error) {
        console.error('Error incrementing likes:', error);
        return;
      }

      // Update local state
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, likes: (listing.likes || 0) + 1 }
            : listing
        )
      }));
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  },

  // Filter setters
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setMinRating: (rating) => set({ minRating: rating }),

  clearFilters: () => set({
    selectedCategory: '',
    searchQuery: '',
    selectedLocation: '',
    selectedCondition: '',
    priceRange: [0, 1000],
    sortBy: 'recent',
    minRating: 0
  }),

  getFilteredListings: () => {
    const state = get();
    let filtered = [...state.listings];

    // Apply filters
    if (state.selectedCategory) {
      filtered = filtered.filter(item => item.category === state.selectedCategory);
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.wanted_items && item.wanted_items.some(wanted => 
          wanted.toLowerCase().includes(query)
        ))
      );
    }

    if (state.selectedLocation) {
      filtered = filtered.filter(item => 
        item.location && item.location.toLowerCase().includes(state.selectedLocation.toLowerCase())
      );
    }

    if (state.selectedCondition) {
      filtered = filtered.filter(item => item.condition === state.selectedCondition);
    }

    // Apply sorting
    switch (state.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
    }

    return filtered;
  },

  updateListingConversationStatus: (listingId, hasActiveMessage) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === listingId 
          ? { ...listing, hasActiveMessage }
          : listing
      )
    }));
  },

  checkAndUpdateConversationStatuses: async () => {
    const state = get();
    
    try {
      const updatedListings = await Promise.all(
        state.listings.map(async (listing) => {
          try {
            const { data: hasConversation } = await supabase
              .rpc('listing_has_active_conversation', { listing_uuid: listing.id });
            
            return {
              ...listing,
              hasActiveMessage: hasConversation || false
            };
          } catch (error) {
            console.error(`Error checking conversation for listing ${listing.id}:`, error);
            return listing;
          }
        })
      );

      set({ listings: updatedListings });
    } catch (error) {
      console.error('Error updating conversation statuses:', error);
    }
  }
}));
