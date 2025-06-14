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
  isOwnItem?: boolean; // Flag to indicate if this is user's own item
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
  currentUserId: string | null;
  
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedCondition: (condition: string) => void;
  setSortBy: (sort: string) => void;
  setSwapFilter: (filter: 'all' | 'swapped' | 'unswapped') => void;
  setMaxDistance: (distance: number) => void;
  setCurrentUserId: (userId: string | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  fetchListings: () => Promise<void>;
  fetchUserListings: (userId: string) => Promise<void>;
  getUserListings: (userId: string) => Promise<Listing[]>;
  createListing: (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  markAsCompleted: (id: string) => Promise<void>;
  markItemAsMessaged: (itemId: string) => void;
  filteredListings: () => Listing[];
  geocodeLocation: (location: string) => Promise<{ lat: number; lng: number } | null>;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  incrementViews: (id: string) => Promise<void>;
}

export const useListingStore = create<ListingStore>((set, get) => ({
  listings: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: 'all',
  selectedCondition: 'all',
  sortBy: 'distance', // Default to distance sorting
  swapFilter: 'all',
  maxDistance: 25, // Default to 25 miles
  userLocation: null,
  currentUserId: null,

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCondition: (condition) => set({ selectedCondition: condition }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSwapFilter: (filter) => set({ swapFilter: filter }),
  setMaxDistance: (distance) => set({ maxDistance: distance }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  setUserLocation: (location) => {
    set({ userLocation: location });
    // If user location is set and we don't have a specific sort preference, default to distance
    const { sortBy } = get();
    if (location && sortBy === 'newest') {
      set({ sortBy: 'distance' });
    }
  },

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
    console.log('=== FETCH LISTINGS START ===');
    set({ loading: true, error: null });
    
    try {
      // First get all listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('Raw listings data:', listingsData);
      console.log('Listings error:', listingsError);

      if (listingsError) {
        console.error('Supabase error:', listingsError);
        throw listingsError;
      }

      // Get unique user IDs from listings
      const userIds = [...new Set(listingsData?.map(listing => listing.user_id).filter(Boolean) || [])];
      
      // Fetch profiles for all user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar')
        .in('id', userIds);

      console.log('Profiles data:', profilesData);
      console.log('Profiles error:', profilesError);

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        // Don't throw, just log and continue with empty profiles
      }

      // Create a map of user profiles for quick lookup
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      console.log('Fetched listings from database:', listingsData);
      
      const { geocodeLocation, calculateDistance, userLocation, currentUserId } = get();
      
      // Transform the data and add coordinates/distance
      const transformedListings = await Promise.all((listingsData || []).map(async (listing) => {
        const coordinates = listing.location ? await geocodeLocation(listing.location) : null;
        let distance = undefined;
        
        if (coordinates && userLocation) {
          distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            coordinates.lat, 
            coordinates.lng
          );
          console.log(`Distance for ${listing.title}: ${distance} miles`);
        }

        // Check if this is the user's own item
        const isOwnItem = currentUserId ? listing.user_id === currentUserId : false;

        // Get profile for this listing
        const profile = listing.user_id ? profilesMap.get(listing.user_id) : null;

        return {
          ...listing,
          profiles: profile || {
            username: 'Anonymous User',
            first_name: 'Anonymous',
            last_name: 'User',
            avatar: 'A'
          },
          coordinates,
          distance,
          isOwnItem
        };
      }));

      console.log('Transformed listings:', transformedListings);
      set({ listings: transformedListings, loading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ error: 'Failed to fetch listings', loading: false });
    }
    
    console.log('=== FETCH LISTINGS END ===');
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
    console.log('=== CREATELIST FUNCTION START ===');
    console.log('Input listing data:', listing);
    
    set({ loading: true, error: null });
    
    try {
      console.log('About to call supabase.from("listings").insert()...');
      console.log('Supabase client:', supabase);
      
      const insertData = {
        ...listing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Insert data being sent:', insertData);
      
      const { data, error } = await supabase
        .from('listings')
        .insert([insertData])
        .select()
        .single();
      
      console.log('Insert with select result - data:', data, 'error:', error);

      if (error) {
        console.error('Insert error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('Successfully created listing:', data);

      // Add the new listing to the store
      set((state) => ({
        listings: [data, ...state.listings],
        loading: false
      }));

      console.log('Updated state with new listing');
      console.log('=== CREATELIST FUNCTION END SUCCESS ===');
      return data;
    } catch (error) {
      console.error('=== CREATELIST FUNCTION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error hint:', error?.hint);
      console.error('Error details field:', error?.details);
      set({ error: 'Failed to create listing', loading: false });
      throw error;
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

  incrementViews: async (id: string) => {
    try {
      // Increment views in the database
      const { error } = await supabase
        .from('listings')
        .update({ views: supabase.sql`views + 1` })
        .eq('id', id);

      if (error) {
        console.error('Error incrementing views:', error);
        return;
      }

      // Update the local state
      set((state) => ({
        listings: state.listings.map((listing) =>
          listing.id === id ? { ...listing, views: (listing.views || 0) + 1 } : listing
        )
      }));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
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
      userLocation,
      currentUserId
    } = get();
    
    let filtered = [...listings];

    console.log('Filtering listings:', {
      totalListings: filtered.length,
      maxDistance,
      userLocation,
      hasUserLocation: !!userLocation,
      currentUserId
    });

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
    let localItems: Listing[] = [];
    let userOwnItems: Listing[] = [];
    
    if (currentUserId) {
      // Separate user's own items
      userOwnItems = filtered.filter((listing) => listing.user_id === currentUserId);
      // Get items that are not user's own
      filtered = filtered.filter((listing) => listing.user_id !== currentUserId);
    }

    if (userLocation && maxDistance > 0) {
      const beforeDistanceFilter = filtered.length;
      localItems = filtered.filter((listing) => {
        // If listing has no distance data (no location), exclude it when distance filtering is active
        if (listing.distance === undefined) {
          console.log(`Excluding ${listing.title} - no location data`);
          return false;
        }
        const withinDistance = listing.distance <= maxDistance;
        if (!withinDistance) {
          console.log(`Excluding ${listing.title} - distance: ${listing.distance} > ${maxDistance}`);
        }
        return withinDistance;
      });
      console.log(`Distance filter: ${beforeDistanceFilter} -> ${localItems.length} items (within ${maxDistance} miles)`);
    } else {
      localItems = filtered;
    }

    // If no local items found and user has items, show user's items
    let finalItems: Listing[];
    if (localItems.length === 0 && userOwnItems.length > 0) {
      console.log('No local items found, showing user\'s own items');
      finalItems = userOwnItems;
    } else {
      // Show local items (and optionally user's items if they want to see them)
      finalItems = localItems;
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        finalItems.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'oldest':
        finalItems.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      case 'title':
        finalItems.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'distance':
        // Sort by distance, putting items with distance first (closest first), then items without distance
        finalItems.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          if (a.distance !== undefined && b.distance === undefined) {
            return -1; // a comes first (has distance)
          }
          if (a.distance === undefined && b.distance !== undefined) {
            return 1; // b comes first (has distance)
          }
          // Both don't have distance, sort by newest
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
        break;
      case 'views':
        finalItems.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'likes':
        finalItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        // Default to distance if user location is available, otherwise newest
        if (userLocation) {
          finalItems.sort((a, b) => {
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance;
            }
            if (a.distance !== undefined && b.distance === undefined) {
              return -1;
            }
            if (a.distance === undefined && b.distance !== undefined) {
              return 1;
            }
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
          });
        } else {
          finalItems.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        }
        break;
    }

    console.log(`Final filtered results: ${finalItems.length} items`);
    return finalItems;
  },
}));
