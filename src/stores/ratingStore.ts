
import { create } from 'zustand';

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  rating: number;
  comment: string;
  listingId: string;
  listingTitle: string;
  createdAt: Date;
}

interface RatingState {
  ratings: Rating[];
  submitRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => void;
  getUserRatings: (userId: string) => Rating[];
  getAverageRating: (userId: string) => number;
  canRateUser: (fromUserId: string, toUserId: string, listingId: string) => boolean;
}

// Dummy ratings data
const dummyRatings: Rating[] = [
  {
    id: '1',
    fromUserId: '1',
    toUserId: '2',
    fromUserName: 'John D.',
    toUserName: 'Sarah M.',
    rating: 5,
    comment: 'Great swap! Item was exactly as described.',
    listingId: '1',
    listingTitle: 'Vintage Coffee Maker',
    createdAt: new Date('2024-06-05')
  },
  {
    id: '2',
    fromUserId: '2',
    toUserId: '1',
    fromUserName: 'Sarah M.',
    toUserName: 'John D.',
    rating: 4,
    comment: 'Smooth transaction, would swap again!',
    listingId: '2',
    listingTitle: 'Programming Books Collection',
    createdAt: new Date('2024-06-06')
  }
];

export const useRatingStore = create<RatingState>((set, get) => ({
  ratings: dummyRatings,

  submitRating: (ratingData) => {
    const newRating: Rating = {
      ...ratingData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    set(state => ({
      ratings: [...state.ratings, newRating]
    }));
  },

  getUserRatings: (userId) => {
    return get().ratings.filter(rating => rating.toUserId === userId);
  },

  getAverageRating: (userId) => {
    const userRatings = get().ratings.filter(rating => rating.toUserId === userId);
    if (userRatings.length === 0) return 0;
    
    const sum = userRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / userRatings.length) * 10) / 10;
  },

  canRateUser: (fromUserId, toUserId, listingId) => {
    const existingRating = get().ratings.find(
      rating => 
        rating.fromUserId === fromUserId && 
        rating.toUserId === toUserId && 
        rating.listingId === listingId
    );
    return !existingRating;
  }
}));
