
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
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
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: Partial<UserProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  canCreateListing: () => boolean;
  canMakeSwap: () => boolean;
  upgradeToPremium: () => Promise<void>;
  processSubscriptionPayment: (planType: 'monthly' | 'yearly') => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        try {
          // Get initial session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const userProfile: UserProfile = {
                id: profile.id,
                email: session.user.email || '',
                username: profile.username || '',
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                location: profile.location || '',
                membershipType: profile.membership_type as 'free' | 'premium',
                joinedDate: new Date(profile.joined_date),
                rating: parseFloat(profile.rating) || 0,
                totalSwaps: profile.total_swaps || 0,
                monthlyListings: profile.monthly_listings || 0,
                monthlySwaps: profile.monthly_swaps || 0,
                avatar: profile.avatar || ''
              };

              set({ 
                user: userProfile, 
                session, 
                isAuthenticated: true, 
                isLoading: false 
              });
            }
          } else {
            set({ isLoading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profile) {
                const userProfile: UserProfile = {
                  id: profile.id,
                  email: session.user.email || '',
                  username: profile.username || '',
                  firstName: profile.first_name || '',
                  lastName: profile.last_name || '',
                  location: profile.location || '',
                  membershipType: profile.membership_type as 'free' | 'premium',
                  joinedDate: new Date(profile.joined_date),
                  rating: parseFloat(profile.rating) || 0,
                  totalSwaps: profile.total_swaps || 0,
                  monthlyListings: profile.monthly_listings || 0,
                  monthlySwaps: profile.monthly_swaps || 0,
                  avatar: profile.avatar || ''
                };

                set({ 
                  user: userProfile, 
                  session, 
                  isAuthenticated: true 
                });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                session: null, 
                isAuthenticated: false 
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error);
            return false;
          }

          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      signup: async (email: string, password: string, userData: Partial<UserProfile>) => {
        try {
          const redirectUrl = `${window.location.origin}/`;
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                location: userData.location,
              }
            }
          });

          if (error) {
            console.error('Signup error:', error);
            return false;
          }

          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) return;

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              username: updates.username,
              first_name: updates.firstName,
              last_name: updates.lastName,
              location: updates.location,
            })
            .eq('id', user.id);

          if (!error) {
            set({ user: { ...user, ...updates } });
          }
        } catch (error) {
          console.error('Profile update error:', error);
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });

          return !error;
        } catch (error) {
          console.error('Password change error:', error);
          return false;
        }
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

      upgradeToPremium: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { error } = await supabase
            .from('profiles')
            .update({ membership_type: 'premium' })
            .eq('id', user.id);

          if (!error) {
            set({ user: { ...user, membershipType: 'premium' } });
          }
        } catch (error) {
          console.error('Upgrade error:', error);
        }
      },

      processSubscriptionPayment: async (planType: 'monthly' | 'yearly') => {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { user } = get();
        if (user) {
          await get().upgradeToPremium();
          return true;
        }
        return false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
