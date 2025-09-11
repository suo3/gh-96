
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price?: number;
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
    phone_number?: string;
    rating?: number;
    total_sales?: number;
    is_verified?: boolean;
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
  availabilityFilter: string;
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
  setAvailabilityFilter: (filter: string) => void;
  setMaxDistance: (distance: number) => void;
  setSearchTerm: (term: string) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setCurrentUserId: (userId: string) => void;
  geocodeLocation: (address: string) => Promise<{ lat: number; lng: number } | null>;
  markItemAsMessaged: (itemId: string) => void;
  
  // Computed
  getFilteredListings: () => Listing[];
  applyFilters: () => void;
  
  // New method for conversation tracking
  updateListingConversationStatus: (listingId: string, hasActiveMessage: boolean) => void;
  checkAndUpdateConversationStatuses: () => Promise<void>;
}

// Helper function to calculate distance between two coordinates in miles
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
  availabilityFilter: 'all',
  maxDistance: 25,
  searchTerm: '',
  userLocation: null,
  filteredListings: [],

  setListings: (listings) => {
    set({ listings });
    get().applyFilters();
  },

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
    const { session, spendCoins, refreshUserProfile } = useAuthStore.getState();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });
    
    try {
      console.log('Adding listing with data:', listing);
      
      // Get listing cost from database
      const { data: listingCost } = await supabase.rpc('get_listing_cost');
      const coinCost = listingCost || 1;
      
      // First spend coins for creating the listing
      const coinSpent = await spendCoins(coinCost, 'Created new listing');
      if (!coinSpent) {
        throw new Error('Insufficient coins to create listing');
      }
      
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

      // Refresh user profile to get updated coin balance
      await refreshUserProfile();

      set(state => ({
        listings: [data, ...state.listings],
        userListings: [data, ...state.userListings],
        isLoading: false
      }));
      
      // Apply filters after adding new listing
      get().applyFilters();
    } catch (error) {
      console.error('Error adding listing:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add listing', isLoading: false });
      throw error;
    }
  },

  updateListing: async (id, updatedListing) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use auth store session instead of getUser()
      const { session } = useAuthStore.getState();
      if (!session?.user) throw new Error('User not authenticated');

      // Only update specific fields to avoid RLS policy violations
      const updatePayload = {
        status: updatedListing.status,
        updated_at: new Date().toISOString()
      };
      
      console.log('UpdateListing payload:', updatePayload);
      console.log('User ID:', session.user.id);
      console.log('Listing ID:', id);

      const { data, error } = await supabase
        .from('listings')
        .update(updatePayload)
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
      
      // Apply filters after updating listing
      get().applyFilters();
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
      
      // Apply filters after deleting listing
      get().applyFilters();
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
      // First fetch listings
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Then fetch profiles for each listing user
      const listingsWithProfiles = await Promise.all(
        (data || []).map(async (listing) => {
          let profiles = null;
          if (listing.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, username, avatar, phone_number, rating, total_sales, is_verified')
              .eq('id', listing.user_id)
              .single();
            profiles = profileData;
          }
          return { ...listing, profiles };
        })
      );

      // Check conversation status for each listing
      const listingsWithConversationStatus = await Promise.all(
        listingsWithProfiles.map(async (listing) => {
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
      
      // Apply filters after setting listings
      get().applyFilters();
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
      // Call the database function to increment views
      const { error } = await supabase.rpc('increment_listing_views', { 
        listing_uuid: id 
      });

      if (error) {
        console.error('Error incrementing views:', error);
        return;
      }

      // Update local state to reflect the change immediately
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, views: (listing.views || 0) + 1 }
            : listing
        )
      }));
      
      // Apply filters after incrementing views
      get().applyFilters();
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  incrementLikes: async (id) => {
    try {
      // Call the database function to increment likes
      const { error } = await supabase.rpc('increment_listing_likes', { 
        listing_uuid: id 
      });

      if (error) {
        console.error('Error incrementing likes:', error);
        return;
      }

      // Update local state to reflect the change immediately
      set(state => ({
        listings: state.listings.map(listing =>
          listing.id === id 
            ? { ...listing, likes: (listing.likes || 0) + 1 }
            : listing
        )
      }));
      
      // Apply filters after incrementing likes
      get().applyFilters();
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  },

  // Filter setters - now they trigger applyFilters
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  setSelectedLocation: (location) => {
    set({ selectedLocation: location });
    get().applyFilters();
  },
  
  setSelectedCondition: (condition) => {
    set({ selectedCondition: condition });
    get().applyFilters();
  },
  
  setPriceRange: (range) => {
    set({ priceRange: range });
    get().applyFilters();
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy });
    get().applyFilters();
  },
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setMinRating: (rating) => {
    set({ minRating: rating });
    get().applyFilters();
  },

  // New setters - now they trigger applyFilters
  setAvailabilityFilter: (filter) => {
    set({ availabilityFilter: filter });
    get().applyFilters();
  },
  
  setMaxDistance: (distance) => {
    set({ maxDistance: distance });
    get().applyFilters();
  },
  
  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().applyFilters();
  },
  
  setUserLocation: (location) => set({ userLocation: location }),
  
  setCurrentUserId: (userId) => {
    // This might be handled differently depending on your auth system
    console.log('Setting current user ID:', userId);
  },

  geocodeLocation: async (address: string) => {
    try {
      console.log('Geocoding address:', address);
      
      // Ghana cities location mapping for better geocoding
      const locationMap: { [key: string]: { lat: number; lng: number } } = {
        // Major Ghana Cities
        'accra': { lat: 5.6037, lng: -0.1870 },
        'kumasi': { lat: 6.6885, lng: -1.6244 },
        'tamale': { lat: 9.4034, lng: -0.8424 },
        'cape coast': { lat: 5.1053, lng: -1.2466 },
        'sekondi': { lat: 4.9344, lng: -1.7195 },
        'takoradi': { lat: 4.8845, lng: -1.7554 },
        'sekondi-takoradi': { lat: 4.9094, lng: -1.7375 },
        'tema': { lat: 5.6698, lng: 0.0166 },
        'ho': { lat: 6.6112, lng: 0.4719 },
        'sunyani': { lat: 7.3379, lng: -2.3265 },
        'koforidua': { lat: 6.0940, lng: -0.2501 },
        'wa': { lat: 10.0606, lng: -2.5057 },
        'bolgatanga': { lat: 10.7856, lng: -0.8516 },
        'tarkwa': { lat: 5.3006, lng: -1.9986 },
        'obuasi': { lat: 6.2073, lng: -1.6647 },
        'techiman': { lat: 7.5933, lng: -1.9336 },
        'nkawkaw': { lat: 6.5525, lng: -0.7681 },
        'yendi': { lat: 9.4427, lng: -0.0093 },
        'kintampo': { lat: 8.0548, lng: -1.7321 },
        'winneba': { lat: 5.3511, lng: -0.6136 },
        'axim': { lat: 4.8693, lng: -2.2397 },
        'elmina': { lat: 5.0831, lng: -1.3491 },
        'keta': { lat: 5.9181, lng: 0.9854 },
        'bawku': { lat: 11.0522, lng: -0.2325 },
        'navrongo': { lat: 10.8956, lng: -1.0923 },
        
        // Ghana Regions (for broader location matching)
        'greater accra': { lat: 5.6037, lng: -0.1870 },
        'ashanti': { lat: 6.6885, lng: -1.6244 },
        'northern': { lat: 9.4034, lng: -0.8424 },
        'central': { lat: 5.1053, lng: -1.2466 },
        'western': { lat: 4.8845, lng: -1.7554 },
        'volta': { lat: 6.6112, lng: 0.4719 },
        'bono': { lat: 7.3379, lng: -2.3265 },
        'eastern': { lat: 6.0940, lng: -0.2501 },
        'upper west': { lat: 10.0606, lng: -2.5057 },
        'upper east': { lat: 10.7856, lng: -0.8516 }
      };

      const addressLower = address.toLowerCase();
      
      // First try exact match
      if (locationMap[addressLower]) {
        console.log('Found exact match for:', address, locationMap[addressLower]);
        return locationMap[addressLower];
      }
      
      // Then try partial matches
      for (const [location, coords] of Object.entries(locationMap)) {
        if (addressLower.includes(location) || location.includes(addressLower)) {
          console.log('Found partial match for:', address, 'with', location, coords);
          return coords;
        }
      }
      
      // If no match found, return default coordinates (Accra, Ghana)
      console.log('No match found for:', address, 'using default coordinates');
      return { lat: 5.6037, lng: -0.1870 }; // Accra coordinates as default
    } catch (error) {
      console.error('Error geocoding location:', error);
      return { lat: 5.6037, lng: -0.1870 }; // Fallback to Accra
    }
  },

  markItemAsMessaged: (itemId: string) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === itemId 
          ? { ...listing, hasActiveMessage: true }
          : listing
      )
    }));
    
    // Apply filters after marking as messaged
    get().applyFilters();
  },

  clearFilters: () => {
    set({
      selectedCategory: 'all',
      searchQuery: '',
      selectedLocation: '',
      selectedCondition: 'all',
      priceRange: [0, 1000],
      sortBy: 'newest',
      minRating: 0,
      availabilityFilter: 'all',
      searchTerm: ''
    });
    get().applyFilters();
  },

  applyFilters: () => {
    const state = get();
    let filtered = [...state.listings];

    console.log('Applying filters with state:', {
      selectedCategory: state.selectedCategory,
      searchTerm: state.searchTerm,
      selectedCondition: state.selectedCondition,
      availabilityFilter: state.availabilityFilter,
      maxDistance: state.maxDistance,
      userLocation: state.userLocation,
      totalListings: filtered.length
    });

    // Apply category filter
    if (state.selectedCategory && state.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === state.selectedCategory);
      console.log(`After category filter (${state.selectedCategory}):`, filtered.length);
    }

    // Apply search query filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (item.wanted_items && item.wanted_items.some(wanted => 
          wanted.toLowerCase().includes(query)
        ))
      );
      console.log(`After search query filter (${state.searchQuery}):`, filtered.length);
    }

    // Apply search term filter
    if (state.searchTerm) {
      const query = state.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        (item.wanted_items && item.wanted_items.some(wanted => 
          wanted.toLowerCase().includes(query)
        ))
      );
      console.log(`After search term filter (${state.searchTerm}):`, filtered.length);
    }

    // Apply location filter
    if (state.selectedLocation) {
      filtered = filtered.filter(item => 
        item.location && item.location.toLowerCase().includes(state.selectedLocation.toLowerCase())
      );
      console.log(`After location filter (${state.selectedLocation}):`, filtered.length);
    }

    // Apply condition filter
    if (state.selectedCondition && state.selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === state.selectedCondition);
      console.log(`After condition filter (${state.selectedCondition}):`, filtered.length);
    }

    // Apply availability filter
    if (state.availabilityFilter === 'available') {
      filtered = filtered.filter(item => !item.hasActiveMessage);
      console.log('After available filter:', filtered.length);
    } else if (state.availabilityFilter === 'contacted') {
      filtered = filtered.filter(item => item.hasActiveMessage);
      console.log('After contacted filter:', filtered.length);
    }

    // Apply distance filter - Enhanced with better location mapping
    if (state.userLocation && state.maxDistance) {
      filtered = filtered.filter(item => {
        if (!item.location) return true; // Include items without location data
        
        // Use Ghana cities location mapping for distance filtering
        const locationCoords: { [key: string]: { lat: number; lng: number } } = {
          // Major Ghana Cities
          'accra': { lat: 5.6037, lng: -0.1870 },
          'kumasi': { lat: 6.6885, lng: -1.6244 },
          'tamale': { lat: 9.4034, lng: -0.8424 },
          'cape coast': { lat: 5.1053, lng: -1.2466 },
          'sekondi': { lat: 4.9344, lng: -1.7195 },
          'takoradi': { lat: 4.8845, lng: -1.7554 },
          'sekondi-takoradi': { lat: 4.9094, lng: -1.7375 },
          'tema': { lat: 5.6698, lng: 0.0166 },
          'ho': { lat: 6.6112, lng: 0.4719 },
          'sunyani': { lat: 7.3379, lng: -2.3265 },
          'koforidua': { lat: 6.0940, lng: -0.2501 },
          'wa': { lat: 10.0606, lng: -2.5057 },
          'bolgatanga': { lat: 10.7856, lng: -0.8516 },
          'tarkwa': { lat: 5.3006, lng: -1.9986 },
          'obuasi': { lat: 6.2073, lng: -1.6647 },
          'techiman': { lat: 7.5933, lng: -1.9336 },
          'nkawkaw': { lat: 6.5525, lng: -0.7681 },
          'yendi': { lat: 9.4427, lng: -0.0093 },
          'kintampo': { lat: 8.0548, lng: -1.7321 },
          'winneba': { lat: 5.3511, lng: -0.6136 },
          'axim': { lat: 4.8693, lng: -2.2397 },
          'elmina': { lat: 5.0831, lng: -1.3491 },
          'keta': { lat: 5.9181, lng: 0.9854 },
          'bawku': { lat: 11.0522, lng: -0.2325 },
          'navrongo': { lat: 10.8956, lng: -1.0923 },
          
          // Ghana Regions (for broader location matching)
          'greater accra': { lat: 5.6037, lng: -0.1870 },
          'ashanti': { lat: 6.6885, lng: -1.6244 },
          'northern': { lat: 9.4034, lng: -0.8424 },
          'central': { lat: 5.1053, lng: -1.2466 },
          'western': { lat: 4.8845, lng: -1.7554 },
          'volta': { lat: 6.6112, lng: 0.4719 },
          'bono': { lat: 7.3379, lng: -2.3265 },
          'eastern': { lat: 6.0940, lng: -0.2501 },
          'upper west': { lat: 10.0606, lng: -2.5057 },
          'upper east': { lat: 10.7856, lng: -0.8516 }
        };
        
        // Try to find coordinates for the item location
        const itemLocationKey = item.location.toLowerCase();
        let itemCoords = null;
        
        // First try exact match
        if (locationCoords[itemLocationKey]) {
          itemCoords = locationCoords[itemLocationKey];
        } else {
          // Then try partial matches
          for (const [location, coords] of Object.entries(locationCoords)) {
            if (itemLocationKey.includes(location) || location.includes(itemLocationKey)) {
              itemCoords = coords;
              break;
            }
          }
        }
        
        if (!itemCoords) {
          // If we can't determine coordinates, include the item (don't filter out)
          console.log(`No coordinates found for location: ${item.location}, including in results`);
          return true;
        }
        
        const distance = calculateDistance(
          state.userLocation.lat,
          state.userLocation.lng,
          itemCoords.lat,
          itemCoords.lng
        );
        
        console.log(`Distance from user to ${item.location}: ${distance.toFixed(1)} miles`);
        return distance <= state.maxDistance;
      });
      console.log(`After distance filter (${state.maxDistance} miles):`, filtered.length);
    }

    // Apply price range filter
    if (state.priceRange && (state.priceRange[0] > 0 || state.priceRange[1] < 1000)) {
      filtered = filtered.filter(item => {
        const itemPrice = item.price || 0;
        return itemPrice >= state.priceRange[0] && itemPrice <= state.priceRange[1];
      });
      console.log(`After price filter (GH₵${state.priceRange[0]} - GH₵${state.priceRange[1]}):`, filtered.length);
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
      case 'distance':
        if (state.userLocation) {
          filtered.sort((a, b) => {
            // Use Ghana cities location mapping for distance sorting
            const locationCoords: { [key: string]: { lat: number; lng: number } } = {
              // Major Ghana Cities
              'accra': { lat: 5.6037, lng: -0.1870 },
              'kumasi': { lat: 6.6885, lng: -1.6244 },
              'tamale': { lat: 9.4034, lng: -0.8424 },
              'cape coast': { lat: 5.1053, lng: -1.2466 },
              'sekondi': { lat: 4.9344, lng: -1.7195 },
              'takoradi': { lat: 4.8845, lng: -1.7554 },
              'sekondi-takoradi': { lat: 4.9094, lng: -1.7375 },
              'tema': { lat: 5.6698, lng: 0.0166 },
              'ho': { lat: 6.6112, lng: 0.4719 },
              'sunyani': { lat: 7.3379, lng: -2.3265 },
              'koforidua': { lat: 6.0940, lng: -0.2501 },
              'wa': { lat: 10.0606, lng: -2.5057 },
              'bolgatanga': { lat: 10.7856, lng: -0.8516 },
              'tarkwa': { lat: 5.3006, lng: -1.9986 },
              'obuasi': { lat: 6.2073, lng: -1.6647 },
              'techiman': { lat: 7.5933, lng: -1.9336 },
              'nkawkaw': { lat: 6.5525, lng: -0.7681 },
              'yendi': { lat: 9.4427, lng: -0.0093 },
              'kintampo': { lat: 8.0548, lng: -1.7321 },
              'winneba': { lat: 5.3511, lng: -0.6136 },
              'axim': { lat: 4.8693, lng: -2.2397 },
              'elmina': { lat: 5.0831, lng: -1.3491 },
              'keta': { lat: 5.9181, lng: 0.9854 },
              'bawku': { lat: 11.0522, lng: -0.2325 },
              'navrongo': { lat: 10.8956, lng: -1.0923 },
              
              // Ghana Regions (for broader location matching)
              'greater accra': { lat: 5.6037, lng: -0.1870 },
              'ashanti': { lat: 6.6885, lng: -1.6244 },
              'northern': { lat: 9.4034, lng: -0.8424 },
              'central': { lat: 5.1053, lng: -1.2466 },
              'western': { lat: 4.8845, lng: -1.7554 },
              'volta': { lat: 6.6112, lng: 0.4719 },
              'bono': { lat: 7.3379, lng: -2.3265 },
              'eastern': { lat: 6.0940, lng: -0.2501 },
              'upper west': { lat: 10.0606, lng: -2.5057 },
              'upper east': { lat: 10.7856, lng: -0.8516 }
            };
            
            const getDistance = (item: Listing) => {
              if (!item.location) return Infinity;
              const itemLocationKey = item.location.toLowerCase();
              
              // First try exact match
              if (locationCoords[itemLocationKey]) {
                return calculateDistance(
                  state.userLocation!.lat,
                  state.userLocation!.lng,
                  locationCoords[itemLocationKey].lat,
                  locationCoords[itemLocationKey].lng
                );
              }
              
              // Then try partial matches
              for (const [location, coords] of Object.entries(locationCoords)) {
                if (itemLocationKey.includes(location) || location.includes(itemLocationKey)) {
                  return calculateDistance(
                    state.userLocation!.lat,
                    state.userLocation!.lng,
                    coords.lat,
                    coords.lng
                  );
                }
              }
              
              return Infinity;
            };
            
            return getDistance(a) - getDistance(b);
          });
        }
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

    console.log('Final filtered results:', filtered.length);
    set({ filteredListings: filtered });
  },

  getFilteredListings: () => {
    return get().filteredListings;
  },

  updateListingConversationStatus: (listingId, hasActiveMessage) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === listingId 
          ? { ...listing, hasActiveMessage }
          : listing
      )
    }));
    
    // Apply filters after updating conversation status
    get().applyFilters();
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
      get().applyFilters();
    } catch (error) {
      console.error('Error updating conversation statuses:', error);
    }
  }
}));
