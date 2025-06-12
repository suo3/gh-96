
import { create } from 'zustand';

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
  userListings: Listing[];
  createListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>) => string;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  markAsCompleted: (id: string) => void;
  getUserListings: (userId: string) => Listing[];
  getAllListings: () => Listing[];
}

// Dummy listings data
const dummyListings: Listing[] = [
  {
    id: '1',
    title: 'Vintage Coffee Maker',
    description: 'Great condition, just upgraded to a newer model',
    category: 'Kitchen',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop'],
    userId: '2',
    userName: 'Sarah M.',
    userAvatar: 'S',
    location: '0.8 miles away',
    wantedItems: ['Books', 'Plants', 'Open to offers'],
    status: 'active',
    createdAt: new Date('2024-06-10'),
    updatedAt: new Date('2024-06-10'),
    views: 24,
    likes: 8
  },
  {
    id: '2',
    title: 'Programming Books Collection',
    description: 'React, JavaScript, and Python books - perfect for learning',
    category: 'Books',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop'],
    userId: '1',
    userName: 'John D.',
    userAvatar: 'J',
    location: '1.2 miles away',
    wantedItems: ['Electronics', 'Kitchen items'],
    status: 'active',
    createdAt: new Date('2024-06-09'),
    updatedAt: new Date('2024-06-09'),
    views: 18,
    likes: 5
  }
];

export const useListingStore = create<ListingState>((set, get) => ({
  listings: dummyListings,
  userListings: [],

  createListing: (listingData) => {
    const newListing: Listing = {
      ...listingData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      status: 'active'
    };

    set(state => ({
      listings: [...state.listings, newListing]
    }));

    return newListing.id;
  },

  updateListing: (id, updates) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === id
          ? { ...listing, ...updates, updatedAt: new Date() }
          : listing
      )
    }));
  },

  deleteListing: (id) => {
    set(state => ({
      listings: state.listings.filter(listing => listing.id !== id)
    }));
  },

  markAsCompleted: (id) => {
    set(state => ({
      listings: state.listings.map(listing =>
        listing.id === id
          ? { ...listing, status: 'completed', updatedAt: new Date() }
          : listing
      )
    }));
  },

  getUserListings: (userId) => {
    return get().listings.filter(listing => listing.userId === userId);
  },

  getAllListings: () => {
    return get().listings.filter(listing => listing.status === 'active');
  }
}));
