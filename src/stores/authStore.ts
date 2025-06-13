import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  location: string;
  membershipType: 'free' | 'premium';
  joinedDate: Date;
  rating: number;
  totalSwaps: number;
  monthlyListings: number;
  monthlySwaps: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  canCreateListing: () => boolean;
  canMakeSwap: () => boolean;
  upgradeToPremium: () => void;
  processSubscriptionPayment: (planType: 'monthly' | 'yearly') => Promise<boolean>;
}

// Dummy users data
const dummyUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    location: 'Seattle, WA',
    membershipType: 'free',
    joinedDate: new Date('2024-01-15'),
    rating: 4.5,
    totalSwaps: 12,
    monthlyListings: 3,
    monthlySwaps: 5,
    avatar: 'J'
  },
  {
    id: '2',
    email: 'sarah@example.com',
    username: 'sarah_m',
    firstName: 'Sarah',
    lastName: 'Miller',
    location: 'Portland, OR',
    membershipType: 'premium',
    joinedDate: new Date('2023-11-20'),
    rating: 4.8,
    totalSwaps: 28,
    monthlyListings: 15,
    monthlySwaps: 12,
    avatar: 'S'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = dummyUsers.find(u => u.email === email);
        if (user && password === 'password123') {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      signup: async (email: string, password: string, userData: Partial<User>) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          username: userData.username || email.split('@')[0],
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          location: userData.location || '',
          membershipType: 'free',
          joinedDate: new Date(),
          rating: 0,
          totalSwaps: 0,
          monthlyListings: 0,
          monthlySwaps: 0,
          avatar: userData.firstName?.charAt(0) || email.charAt(0).toUpperCase()
        };
        
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, you would verify the current password
        // For demo purposes, we'll just simulate success
        if (currentPassword === 'password123') {
          return true;
        }
        return false;
      },

      canCreateListing: () => {
        const { user } = get();
        if (!user) return false;
        if (user.membershipType === 'premium') return true;
        return user.monthlyListings < 10;
      },

      canMakeSwap: () => {
        const { user } = get();
        if (!user) return false;
        if (user.membershipType === 'premium') return true;
        return user.monthlySwaps < 20;
      },

      upgradeToPremium: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, membershipType: 'premium' } });
        }
      },

      processSubscriptionPayment: async (planType: 'monthly' | 'yearly') => {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { user } = get();
        if (user) {
          set({ user: { ...user, membershipType: 'premium' } });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
