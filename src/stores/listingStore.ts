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
  
  // New properties needed by FilterPanel and other components
  swapFilter: string;
  maxDistance: number;
  searchTerm: string;
  userLocation: { lat: number; lng: number } | null;
  filteredListings: Listing[];
  
  // Actions
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateListing: (id: string, listing: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  markAsCompleted: (id: string) => Promise<void>;
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
  
  // New methods needed by components
  setSwapFilter: (filter: string) => void;
  setMaxDistance: (distance: number) => void;
  setSearchTerm: (term: string) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setCurrentUserId: (userId: string) => void;
  geocodeLocation: (address: string) => Promise<{ lat: number; lng: number } | null>;
  markItemAsMessaged: (itemId: string) => void;
  
  // Computed
  getFilteredListings: () => Listing[];
  
  // New method for conversation tracking
  updateListingConversationStatus: (listingId: string, hasActiveMessage: boolean) => void;
  checkAndUpdateConversationStatuses: () => Promise<void>;
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  userListings: [],
  categories: [],
  selectedCategory: 'all',
  searchQuery: '',
  selectedLocation: '',
  selectedCondition: 'all',
  priceRange: [0, 1000],
  sortBy: 'newest',
  viewMode: 'grid',
  minRating: 0,
  isLoading: false,
  error: null,
  
  // New properties
  swapFilter: 'all',
  maxDistance: 25,
  searchTerm: '',
  userLocation: null,
  filteredListings: [],

  setListings: (listings) => set({ listings, filteredListings: listings }),

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const categoryNames = data?.map(cat => cat.name) || [];
      set({ categories: categoryNames });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  addListing: async (listing) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });
    
    try {
      console.log('Adding listing with data:', listing);
      
      const { data, error } = await supabase
        .from('listings')
        .insert({
          ...listing,
          user_id: session.user.id,
          images: listing.images || [],
          wanted_items: listing.wanted_items || []
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Listing created successfully:', data);

      set(state => ({
        listings: [data, ...state.listings],
        userListings: [data, ...state.userListings],
        filteredListings: [data, ...state.filteredListings],
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
        filteredListings: state.filteredListings.map(listing => 
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
        filteredListings: state.filteredListings.filter(listing => listing.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting listing:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete listing', isLoading: false });
      throw error;
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
      console.error('Error fetching user listings:', error);
      return [];
    }
  },

  markAsCompleted: async (id: string) => {
    await get().updateListing(id, { status: 'completed' });
  },

  fetchListings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // First fetch listings without profiles to avoid the relation error
      const { data, error } = await supabase
        .from('listings')
        .select('*')
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
        filteredListings: listingsWithConversationStatus,
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
      // For now, just update locally since the RPC function doesn't exist
      // TODO: Create increment_listing_views RPC function in database
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, views: (listing.views || 0) + 1 }
            : listing
        ),
        filteredListings: state.filteredListings.map(listing =>
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
      // For now, just update locally since the RPC function doesn't exist
      // TODO: Create increment_listing_likes RPC function in database
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, likes: (listing.likes || 0) + 1 }
            : listing
        ),
        filteredListings: state.filteredListings.map(listing =>
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

  // New setters
  setSwapFilter: (filter) => set({ swapFilter: filter }),
  setMaxDistance: (distance) => set({ maxDistance: distance }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setUserLocation: (location) => set({ userLocation: location }),
  setCurrentUserId: (userId) => {
    // This might be handled differently depending on your auth system
    console.log('Setting current user ID:', userId);
  },

  geocodeLocation: async (address: string) => {
    // Mock geocoding for now - in production you'd use a real geocoding service
    try {
      // Return mock coordinates for now
      return { lat: 37.7749, lng: -122.4194 }; // San Francisco coordinates
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  },

  markItemAsMessaged: (itemId: string) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === itemId 
          ? { ...listing, hasActiveMessage: true }
          : listing
      ),
      filteredListings: state.filteredListings.map(listing =>
        listing.id === itemId 
          ? { ...listing, hasActiveMessage: true }
          : listing
      )
    }));
  },

  clearFilters: () => set({
    selectedCategory: 'all',
    searchQuery: '',
    selectedLocation: '',
    selectedCondition: 'all',
    priceRange: [0, 1000],
    sortBy: 'newest',
    minRating: 0,
    swapFilter: 'all',
    searchTerm: ''
  }),

  getFilteredListings: () => {
    const state = get();
    let filtered = [...state.listings];

    // Apply filters
    if (state.selectedCategory && state.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === state.selectedCategory);
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (item.wanted_items && item.wanted_items.some(wanted => 
          wanted.toLowerCase().includes(query)
        ))
      );
    }

    if (state.searchTerm) {
      const query = state.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
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

    if (state.selectedCondition && state.selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === state.selectedCondition);
    }

    if (state.swapFilter === 'unswapped') {
      filtered = filtered.filter(item => !item.hasActiveMessage);
    } else if (state.swapFilter === 'swapped') {
      filtered = filtered.filter(item => item.hasActiveMessage);
    }

    // Apply sorting
    switch (state.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'oldest':
        filtered.sort((a, b) => 
          new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
        break;
      case 'newest':
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
      ),
      filteredListings: state.filteredListings.map(listing =>
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

      set({ 
        listings: updatedListings,
        filteredListings: updatedListings
      });
    } catch (error) {
      console.error('Error updating conversation statuses:', error);
    }
  }
}));
