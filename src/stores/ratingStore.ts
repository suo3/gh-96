
import { create } from 'zustand';

export interface Rating {
  id: string;
  ratedUserId: string;
  ratedUserName: string;
  raterUserId: string;
  raterUserName: string;
  rating: number;
  comment: string;
  itemTitle: string;
  createdAt: Date;
}

interface RatingState {
  ratings: Rating[];
  addRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => void;
  getUserRatings: (userId: string) => Rating[];
  getAverageRating: (userId: string) => number;
}

export const useRatingStore = create<RatingState>((set, get) => ({
  ratings: [
    {
      id: '1',
      ratedUserId: 'user-2',
      ratedUserName: 'Sarah Johnson',
      raterUserId: 'user-1',
      raterUserName: 'John Doe',
      rating: 5,
      comment: 'Great swap experience! Very responsive and item was exactly as described.',
      itemTitle: 'Vintage Camera',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      ratedUserId: 'user-1',
      ratedUserName: 'John Doe',
      raterUserId: 'user-3',
      raterUserName: 'Mike Chen',
      rating: 4,
      comment: 'Smooth transaction, would swap again.',
      itemTitle: 'Gaming Console',
      createdAt: new Date('2024-01-10')
    }
  ],
  
  addRating: (newRating) => set((state) => ({
    ratings: [...state.ratings, {
      ...newRating,
      id: Date.now().toString(),
      createdAt: new Date()
    }]
  })),
  
  getUserRatings: (userId: string) => {
    return get().ratings.filter(rating => rating.ratedUserId === userId);
  },
  
  getAverageRating: (userId: string) => {
    const userRatings = get().getUserRatings(userId);
    if (userRatings.length === 0) return 0;
    const sum = userRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / userRatings.length) * 10) / 10;
  }
}));
