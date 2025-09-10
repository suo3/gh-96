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
  phoneNumber?: string;
  location: string;
  bio?: string;
  profileImageUrl?: string;
  coins: number;
  joinedDate: Date;
  rating: number;
  totalSales: number;
  monthlyListings: number;
  monthlySales: number;
  achievements?: string[];
  // Ghana-specific fields
  preferredLanguage?: string;
  region?: string;
  city?: string;
  businessType?: string;
  preferredContactMethod?: string;
  isVerified?: boolean;
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
  canMakeSale: () => boolean;
  spendCoins: (amount: number, description: string) => Promise<boolean>;
  initialize: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      refreshUserProfile: async () => {
        const { user, session } = get();
        if (!user || !session) return;

        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile && !error) {
            const updatedUser: UserProfile = {
              id: profile.id,
              email: session.user.email || '',
              username: profile.username || '',
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              phoneNumber: profile.phone_number || '',
              location: profile.location || '',
              bio: profile.bio || '',
              profileImageUrl: profile.profile_image_url || '',
              coins: profile.coins || 0,
              joinedDate: new Date(profile.joined_date),
              rating: parseFloat(profile.rating?.toString() || '0'),
              totalSales: profile.total_sales || 0,
              monthlyListings: profile.monthly_listings || 0,
              monthlySales: profile.monthly_sales || 0,
              avatar: profile.avatar || '',
              achievements: profile.achievements || [],
              // Ghana-specific fields
              preferredLanguage: profile.preferred_language || 'en',
              region: profile.region || '',
              city: profile.city || '',
              businessType: profile.business_type || '',
              preferredContactMethod: profile.preferred_contact_method || 'whatsapp',
              isVerified: profile.is_verified || false
            };

            set({ user: updatedUser });
          }
        } catch (error) {
          console.error('Error refreshing user profile:', error);
        }
      },

      initialize: async () => {
        try {
          console.log('Initializing auth...');
          
          // Set up auth state listener FIRST
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('User signed in, fetching profile...');
              
              // Use setTimeout to prevent deadlock
              setTimeout(async () => {
                try {
                  const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                  console.log('Profile fetch result:', { profile, error });

                  if (profile && !error) {
                    const userProfile: UserProfile = {
                      id: profile.id,
                      email: session.user.email || '',
                      username: profile.username || '',
                      firstName: profile.first_name || '',
                      lastName: profile.last_name || '',
                      phoneNumber: profile.phone_number || '',
                      location: profile.location || '',
                      bio: profile.bio || '',
                      profileImageUrl: profile.profile_image_url || '',
                      coins: profile.coins || 0,
                      joinedDate: new Date(profile.joined_date),
                      rating: parseFloat(profile.rating?.toString() || '0'),
                        totalSales: profile.total_sales || 0,
                        monthlyListings: profile.monthly_listings || 0,
                        monthlySales: profile.monthly_sales || 0,
                      avatar: profile.avatar || '',
                      achievements: profile.achievements || [],
                      // Ghana-specific fields
                      preferredLanguage: profile.preferred_language || 'en',
                      region: profile.region || '',
                      city: profile.city || '',
                      businessType: profile.business_type || '',
                      preferredContactMethod: profile.preferred_contact_method || 'whatsapp',
                      isVerified: profile.is_verified || false
                    };

                    set({ 
                      user: userProfile, 
                      session, 
                      isAuthenticated: true, 
                      isLoading: false 
                    });
                  } else {
                    console.error('No profile found for user:', session.user.id, error);
                    set({ 
                      user: null,
                      session: null,
                      isAuthenticated: false,
                      isLoading: false 
                    });
                  }
                } catch (error) {
                  console.error('Error fetching profile:', error);
                  set({ 
                    user: null,
                    session: null,
                    isAuthenticated: false,
                    isLoading: false 
                  });
                }
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              set({ 
                user: null, 
                session: null, 
                isAuthenticated: false,
                isLoading: false 
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              console.log('Token refreshed');
              set({ session });
            } else {
              // For other events or no session, ensure loading is false
              set({ isLoading: false });
            }
          });

          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Initial session:', session?.user?.email, error);
          
          if (session?.user) {
            console.log('Found existing session, fetching profile...');
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
              const userProfile: UserProfile = {
                id: profile.id,
                email: session.user.email || '',
                username: profile.username || '',
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                phoneNumber: profile.phone_number || '',
                location: profile.location || '',
                bio: profile.bio || '',
                profileImageUrl: profile.profile_image_url || '',
                coins: profile.coins || 0,
                joinedDate: new Date(profile.joined_date),
                rating: parseFloat(profile.rating?.toString() || '0'),
                totalSales: profile.total_sales || 0,
                monthlyListings: profile.monthly_listings || 0,
                monthlySales: profile.monthly_sales || 0,
                avatar: profile.avatar || '',
                achievements: profile.achievements || [],
                // Ghana-specific fields
                preferredLanguage: profile.preferred_language || 'en',
                region: profile.region || '',
                city: profile.city || '',
                businessType: profile.business_type || '',
                preferredContactMethod: profile.preferred_contact_method || 'whatsapp',
                isVerified: profile.is_verified || false
              };

              set({ 
                user: userProfile, 
                session, 
                isAuthenticated: true, 
                isLoading: false 
              });
            } else {
              console.log('No profile found for existing session');
              set({ isLoading: false });
            }
          } else {
            console.log('No existing session found');
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login for:', email);
          set({ isLoading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            console.error('Login error:', error);
            set({ isLoading: false });
            return false;
          }

          console.log('Login successful for:', email);
          // Note: Don't set loading to false here - let the auth state change handler do it
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (email: string, password: string, userData: Partial<UserProfile>) => {
        try {
          console.log('Attempting signup for:', email, userData);
          set({ isLoading: true });
          
          const redirectUrl = `${window.location.origin}/`;
          
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                username: userData.username,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone_number: userData.phoneNumber,
                location: userData.location,
                preferred_language: userData.preferredLanguage || 'en',
                region: userData.region,
                city: userData.city,
                business_type: userData.businessType,
                preferred_contact_method: userData.preferredContactMethod || 'whatsapp',
              }
            }
          });

          if (error) {
            console.error('Signup error:', error);
            set({ isLoading: false });
            return false;
          }

          console.log('Signup successful for:', email, data);
          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
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
              phone_number: updates.phoneNumber,
              location: updates.location,
              bio: updates.bio,
              profile_image_url: updates.profileImageUrl,
              monthly_listings: updates.monthlyListings,
              monthly_sales: updates.monthlySales,
              total_sales: updates.totalSales,
              coins: updates.coins,
              // Ghana-specific fields
              preferred_language: updates.preferredLanguage,
              region: updates.region,
              city: updates.city,
              business_type: updates.businessType,
              preferred_contact_method: updates.preferredContactMethod,
            })
            .eq('id', user.id);

          if (!error) {
            set({ user: { ...user, ...updates } });
            // Refresh profile to get latest data
            get().refreshUserProfile();
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
        // Note: This checks against current coins, but actual cost is fetched dynamically
        return user.coins >= 1; // Minimum check - actual cost verified in addListing
      },

      canMakeSale: () => {
        const { user } = get();
        if (!user) return false;
        // Note: This checks against current coins, but actual cost is fetched dynamically
        return user.coins >= 2; // Minimum check - actual cost verified when making sale
      },

      spendCoins: async (amount: number, description: string) => {
        const { user } = get();
        if (!user) return false;

        try {
          const { data, error } = await supabase.rpc('spend_coins', {
            coin_amount: amount,
            description: description
          });

          if (!error && data) {
            // Update local state
            set({ user: { ...user, coins: user.coins - amount } });
            // Refresh profile to get latest data
            get().refreshUserProfile();
            return true;
          }

          return false;
        } catch (error) {
          console.error('Error spending coins:', error);
          return false;
        }
      },

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
