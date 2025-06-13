import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  category: string;
  condition: string;
  images?: string[];
  user_id?: string;
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
  hasActiveMessage?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number; // Distance from user in miles
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
  maxDistance: number;
  userLocation: { lat: number; lng: number } | null;
  
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedCondition: (condition: string) => void;
  setSortBy: (sort: string) => void;
  setSwapFilter: (filter: 'all' | 'swapped' | 'unswapped') => void;
  setMaxDistance: (distance: number) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  fetchListings: () => Promise<void>;
  fetchUserListings: (userId: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  createListing: (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  markItemAsMessaged: (itemId: string) => void;
  filteredListings: () => Listing[];
  geocodeLocation: (location: string) => Promise<{ lat: number; lng: number } | null>;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
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
  maxDistance: 25, // Default to 25 miles
  userLocation: null,

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSwapFilter: (filter) => set({ swapFilter: filter }),
  setMaxDistance: (distance) => set({ maxDistance: distance }),
  setUserLocation: (location) => set({ userLocation: location }),

  geocodeLocation: async (location: string) => {
    try {
      // Using a simple geocoding approach - in production, you'd want to use a proper geocoding service
      // For now, we'll use some mock coordinates for common cities
      const cityCoords: { [key: string]: { lat: number; lng: number } } = {
        'seattle, wa': { lat: 47.6062, lng: -122.3321 },
        'new york, ny': { lat: 40.7128, lng: -74.0060 },
        'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
        'chicago, il': { lat: 41.8781, lng: -87.6298 },
        'houston, tx': { lat: 29.7604, lng: -95.3698 },
        'phoenix, az': { lat: 33.4484, lng: -112.0740 },
        'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
        'san antonio, tx': { lat: 29.4241, lng: -98.4936 },
        'san diego, ca': { lat: 32.7157, lng: -117.1611 },
        'dallas, tx': { lat: 32.7767, lng: -96.7970 }
      };

      const normalizedLocation = location.toLowerCase().trim();
      return cityCoords[normalizedLocation] || null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  },

  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  },

  fetchListings: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched listings:', data);
      
      const { geocodeLocation, calculateDistance, userLocation } = get();
      
      // Transform the data and add coordinates/distance
      const transformedListings = await Promise.all((data || []).map(async (listing) => {
        const coordinates = listing.location ? await geocodeLocation(listing.location) : null;
        let distance = undefined;
        
        if (coordinates && userLocation) {
          distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            coordinates.lat, 
            coordinates.lng
          );
        }

        return {
          ...listing,
          profiles: {
            username: 'Anonymous User',
            first_name: 'Anonymous',
            last_name: 'User',
            avatar: 'A'
          },
          coordinates,
          distance
        };
      }));

      set({ listings: transformedListings, loading: false });
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

      const transformedListings = (data || []).map(listing => ({
        ...listing,
        profiles: {
          username: 'Your Profile',
          first_name: 'Your',
          last_name: 'Profile',
          avatar: 'Y'
        }
      }));

      set({ listings: transformedListings, loading: false });
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
      
      return (data || []).map(listing => ({
        ...listing,
        profiles: {
          username: 'Your Profile',
          first_name: 'Your',
          last_name: 'Profile',
          avatar: 'Y'
        }
      }));
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
    const { 
      listings, 
      searchTerm, 
      selectedCategory, 
      selectedCondition, 
      sortBy, 
      swapFilter,
      maxDistance,
      userLocation
    } = get();
    
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
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((listing) => listing.category === selectedCategory);
    }

    // Apply condition filter
    if (selectedCondition && selectedCondition !== 'all') {
      filtered = filtered.filter((listing) => listing.condition === selectedCondition);
    }

    // Apply swap filter
    if (swapFilter === 'swapped') {
      filtered = filtered.filter((listing) => listing.hasActiveMessage === true);
    } else if (swapFilter === 'unswapped') {
      filtered = filtered.filter((listing) => !listing.hasActiveMessage);
    }

    // Apply distance filter if user location is available
    if (userLocation && maxDistance > 0) {
      filtered = filtered.filter((listing) => {
        if (!listing.distance) return true; // Include items without location data
        return listing.distance <= maxDistance;
      });
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
      case 'distance':
        filtered.sort((a, b) => {
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
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
