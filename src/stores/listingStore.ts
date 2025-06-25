
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  wantedItems: string[];
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  createdAt: Date;
  views: number;
  likes: number;
  status: 'active' | 'swapped' | 'inactive';
  profiles?: {
    first_name?: string;
    username?: string;
  };
  hasActiveMessage?: boolean;
}

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface ListingState {
  listings: Listing[];
  userLocation: LocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  selectedCondition: string;
  swapFilter: string;
  maxDistance: number;
  minRating: number;
  searchTerm: string;
  sortBy: string;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'likes'>) => Promise<boolean>;
  fetchListings: () => Promise<void>;
  fetchUserListings: (userId: string) => Promise<Listing[]>;
  deleteListing: (id: string) => Promise<boolean>;
  setUserLocation: (location: LocationCoordinates) => void;
  geocodeLocation: (address: string) => Promise<LocationCoordinates | null>;
  calculateDistance: (listing: Listing) => number | null;
  setSelectedCategory: (category: string) => void;
  setSelectedCondition: (condition: string) => void;
  setSwapFilter: (filter: string) => void;
  setMaxDistance: (distance: number) => void;
  setMinRating: (rating: number) => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: string) => void;
  incrementViews: (listingId: string) => Promise<void>;
  updateListingConversationStatus: (listingId: string, hasActiveMessage: boolean) => void;
  getUserListings: (userId: string) => Promise<Listing[]>;
  markAsCompleted: (id: string) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  filteredListings: Listing[];
  markItemAsMessaged: (itemId: string) => void;
  setCurrentUserId: (userId: string) => void;
}

export const useListingStore = create<ListingState>()((set, get) => ({
  listings: [],
  userLocation: null,
  isLoading: false,
  error: null,
  selectedCategory: 'all',
  selectedCondition: 'all',
  swapFilter: 'all',
  maxDistance: 25,
  minRating: 0,
  searchTerm: '',
  sortBy: 'newest',
  filteredListings: [],

  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setSelectedCondition: (condition: string) => set({ selectedCondition: condition }),
  setSwapFilter: (filter: string) => set({ swapFilter: filter }),
  setMaxDistance: (distance: number) => set({ maxDistance: distance }),
  setMinRating: (rating: number) => set({ minRating: rating }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setSortBy: (sort: string) => set({ sortBy: sort }),

  incrementViews: async (listingId: string) => {
    try {
      // First get current views
      const { data: currentListing, error: fetchError } = await supabase
        .from('listings')
        .select('views')
        .eq('id', listingId)
        .single();

      if (fetchError) {
        console.error('Error fetching current views:', fetchError);
        return;
      }

      const newViews = (currentListing.views || 0) + 1;

      // Update with new views count
      const { error } = await supabase
        .from('listings')
        .update({ views: newViews })
        .eq('id', listingId);

      if (error) {
        console.error('Error incrementing views:', error);
        return;
      }

      set(state => ({
        listings: state.listings.map(listing => 
          listing.id === listingId 
            ? { ...listing, views: newViews }
            : listing
        )
      }));
    } catch (error) {
      console.error('Error in incrementViews:', error);
    }
  },

  updateListingConversationStatus: (listingId: string, hasActiveMessage: boolean) => {
    set(state => ({
      listings: state.listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, hasActiveMessage }
          : listing
      )
    }));
  },

  markItemAsMessaged: (itemId: string) => {
    set(state => ({
      listings: state.listings.map(listing => 
        listing.id === itemId 
          ? { ...listing, hasActiveMessage: true }
          : listing
      )
    }));
  },

  setCurrentUserId: (userId: string) => {
    // This is a placeholder method that doesn't need implementation
    console.log('Setting current user ID:', userId);
  },

  getUserListings: async (userId: string) => {
    return get().fetchUserListings(userId);
  },

  markAsCompleted: async (id: string) => {
    return get().updateListing(id, { status: 'swapped' });
  },

  updateListing: async (id: string, updates: Partial<Listing>) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          condition: updates.condition,
          images: updates.images,
          wanted_items: updates.wantedItems,
          location: updates.location,
          status: updates.status,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating listing:', error);
        set({ error: error.message, isLoading: false });
        return false;
      }

      set(state => ({
        listings: state.listings.map(listing => 
          listing.id === id ? { ...listing, ...updates } : listing
        ),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error in updateListing:', error);
      set({ error: 'Failed to update listing', isLoading: false });
      return false;
    }
  },

  addListing: async (listing) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user has enough coins
      const { canCreateListing, spendCoins } = useAuthStore.getState();
      if (!canCreateListing()) {
        set({ error: 'Insufficient coins to create listing. You need 1 coin.', isLoading: false });
        return false;
      }

      // Spend the coin first
      const coinSpent = await spendCoins(1, 'Created listing: ' + listing.title);
      if (!coinSpent) {
        set({ error: 'Failed to deduct coins. Please try again.', isLoading: false });
        return false;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            title: listing.title,
            description: listing.description,
            category: listing.category,
            condition: listing.condition,
            images: listing.images,
            wanted_items: listing.wantedItems,
            user_id: listing.userId,
            location: listing.location,
            status: listing.status || 'active',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding listing:', error);
        set({ error: error.message, isLoading: false });
        return false;
      }

      const newListing: Listing = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        category: data.category,
        condition: data.condition,
        images: data.images || [],
        wantedItems: data.wanted_items || [],
        userId: data.user_id,
        userName: listing.userName,
        userAvatar: listing.userAvatar,
        location: data.location || '',
        createdAt: new Date(data.created_at),
        views: data.views || 0,
        likes: data.likes || 0,
        status: (data.status as 'active' | 'swapped' | 'inactive') || 'active',
      };

      set(state => ({
        listings: [newListing, ...state.listings],
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Error in addListing:', error);
      set({ error: 'Failed to add listing', isLoading: false });
      return false;
    }
  },

  fetchListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        set({ error: error.message, isLoading: false });
        return;
      }

      const listingsWithDate: Listing[] = data.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description || '',
        category: listing.category,
        condition: listing.condition,
        images: listing.images || [],
        wantedItems: listing.wanted_items || [],
        userId: listing.user_id,
        userName: 'Unknown',
        userAvatar: 'U',
        location: listing.location || '',
        createdAt: new Date(listing.created_at),
        views: listing.views || 0,
        likes: listing.likes || 0,
        status: (listing.status as 'active' | 'swapped' | 'inactive') || 'active',
      }));

      set({ listings: listingsWithDate, isLoading: false });
    } catch (error) {
      console.error('Error in fetchListings:', error);
      set({ error: 'Failed to fetch listings', isLoading: false });
    }
  },

  fetchUserListings: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user listings:', error);
        set({ error: error.message, isLoading: false });
        return [];
      }

      const userListings: Listing[] = data.map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description || '',
        category: listing.category,
        condition: listing.condition,
        images: listing.images || [],
        wantedItems: listing.wanted_items || [],
        userId: listing.user_id,
        userName: 'Unknown',
        userAvatar: 'U',
        location: listing.location || '',
        createdAt: new Date(listing.created_at),
        views: listing.views || 0,
        likes: listing.likes || 0,
        status: (listing.status as 'active' | 'swapped' | 'inactive') || 'active',
      }));

      set({ isLoading: false });
      return userListings;
    } catch (error) {
      console.error('Error in fetchUserListings:', error);
      set({ error: 'Failed to fetch user listings', isLoading: false });
      return [];
    }
  },

  deleteListing: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing:', error);
        set({ error: error.message, isLoading: false });
        return false;
      }

      set(state => ({
        listings: state.listings.filter(listing => listing.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error in deleteListing:', error);
      set({ error: 'Failed to delete listing', isLoading: false });
      return false;
    }
  },

  setUserLocation: (location: LocationCoordinates) => {
    set({ userLocation: location });
  },

  geocodeLocation: async (address: string): Promise<LocationCoordinates | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        console.error('Geocoding failed:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  },

  calculateDistance: (listing: Listing): number | null => {
    const userLocation = get().userLocation;
    if (!userLocation) {
      return null;
    }

    const R = 6371; // Radius of the earth in km
    const deg2rad = (deg: number) => deg * (Math.PI/180)

    try {
      // Geocode the listing location
      get().geocodeLocation(listing.location).then(listingLocation => {
        if (!listingLocation) {
          return null;
        }

        const dLat = deg2rad(listingLocation.lat - userLocation.lat);
        const dLng = deg2rad(listingLocation.lng - userLocation.lng);
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(userLocation.lat)) * Math.cos(deg2rad(listingLocation.lat)) *
          Math.sin(dLng/2) * Math.sin(dLng/2)
          ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km

        return distance;
      });
    } catch (error) {
      console.error("Error calculating distance", error);
      return null;
    }

    return null;
  },
}));
