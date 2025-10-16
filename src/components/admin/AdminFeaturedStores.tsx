import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Crown, Plus, Search, Trash2, User, Star, ShoppingBag, MapPin, Award, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FeaturedStore {
  id: string;
  user_id: string | null;
  distributor_id: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
    bio: string | null;
    rating: number | null;
    total_sales: number | null;
    region: string | null;
    city: string | null;
    is_verified: boolean | null;
  } | null;
  distributor_profiles: {
    id: string;
    name: string;
    email: string | null;
    phone_number: string | null;
    region: string | null;
    city: string | null;
    category: string;
    verification_status: string;
    is_active: boolean;
  } | null;
}

interface UserProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  bio: string | null;
  rating: number | null;
  total_sales: number | null;
  region: string | null;
  city: string | null;
  is_verified: boolean | null;
}

interface DistributorProfile {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  region: string | null;
  city: string | null;
  category: string;
  verification_status: string;
  is_active: boolean;
}

interface AdminFeaturedStoresProps {
  adminRole: string | null;
}

export const AdminFeaturedStores = ({ adminRole }: AdminFeaturedStoresProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [distributorSearchQuery, setDistributorSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [activeTab, setActiveTab] = useState<'users' | 'distributors'>('users');
  const queryClient = useQueryClient();

  // Fetch featured stores
  const { data: featuredStores, isLoading: featuredLoading } = useQuery({
    queryKey: ['admin-featured-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_sellers')
        .select(`
          *,
          profiles!featured_sellers_user_id_fkey (
            id,
            username,
            first_name,
            last_name,
            avatar,
            bio,
            rating,
            total_sales,
            region,
            city,
            is_verified
          ),
          distributor_profiles!featured_sellers_distributor_id_fkey (
            id,
            name,
            email,
            phone_number,
            region,
            city,
            category,
            verification_status,
            is_active
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as FeaturedStore[];
    },
  });

  // Search users
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar, bio, rating, total_sales, region, city, is_verified')
        .or(`username.ilike.%${searchQuery}%, first_name.ilike.%${searchQuery}%, last_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: searchQuery.length >= 2,
  });

  // Search distributors
  const { data: distributorSearchResults, isLoading: distributorSearchLoading } = useQuery({
    queryKey: ['distributor-search', distributorSearchQuery],
    queryFn: async () => {
      if (!distributorSearchQuery || distributorSearchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('distributor_profiles')
        .select('id, name, email, phone_number, region, city, category, verification_status, is_active')
        .or(`name.ilike.%${distributorSearchQuery}%, email.ilike.%${distributorSearchQuery}%, category.ilike.%${distributorSearchQuery}%`)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .limit(10);

      if (error) throw error;
      return data as DistributorProfile[];
    },
    enabled: distributorSearchQuery.length >= 2,
  });

  // Add featured store mutation
  const addFeaturedStore = useMutation({
    mutationFn: async ({ userId, position, type }: { userId: string; position: number; type: 'user' | 'distributor' }) => {
      const { error } = await supabase
        .from('featured_sellers')
        .insert({
          user_id: type === 'user' ? userId : null,
          distributor_id: type === 'distributor' ? userId : null,
          position: position,
          is_active: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-stores'] });
      queryClient.invalidateQueries({ queryKey: ['featured-stores'] });
      toast.success('Store added to featured list');
      setSearchQuery("");
      setDistributorSearchQuery("");
    },
    onError: (error) => {
      console.error('Error adding featured store:', error);
      toast.error('Failed to add featured store');
    },
  });

  // Remove featured store mutation
  const removeFeaturedStore = useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase
        .from('featured_sellers')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-stores'] });
      queryClient.invalidateQueries({ queryKey: ['featured-stores'] });
      toast.success('Store removed from featured list');
    },
    onError: (error) => {
      console.error('Error removing featured store:', error);
      toast.error('Failed to remove featured store');
    },
  });

  // Update position mutation
  const updatePosition = useMutation({
    mutationFn: async ({ storeId, newPosition }: { storeId: string; newPosition: number }) => {
      const { error } = await supabase
        .from('featured_sellers')
        .update({ position: newPosition })
        .eq('id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-stores'] });
      queryClient.invalidateQueries({ queryKey: ['featured-stores'] });
      toast.success('Position updated');
    },
    onError: (error) => {
      console.error('Error updating position:', error);
      toast.error('Failed to update position');
    },
  });

  const getDisplayName = (profile: UserProfile | FeaturedStore['profiles']) => {
    if (!profile) return 'Unknown User';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    if (profile.username) return profile.username;
    return 'Unknown User';
  };

  const getLocationString = (profile: UserProfile | FeaturedStore['profiles']) => {
    if (!profile) return null;
    if (profile.city && profile.region) return `${profile.city}, ${profile.region}`;
    if (profile.region) return profile.region;
    if (profile.city) return profile.city;
    return null;
  };

  const getAvatarInitial = (profile: UserProfile | FeaturedStore['profiles']) => {
    if (!profile) return 'U';
    if (profile.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile.username) return profile.username.charAt(0).toUpperCase();
    return 'U';
  };

  const isUserAlreadyFeatured = (userId: string, type: 'user' | 'distributor') => {
    if (type === 'user') {
      return featuredStores?.some(store => store.user_id === userId);
    } else {
      return featuredStores?.some(store => store.distributor_id === userId);
    }
  };

  const getNextAvailablePosition = () => {
    if (!featuredStores || featuredStores.length === 0) return 1;
    return Math.max(...featuredStores.map(store => store.position)) + 1;
  };

  if (adminRole !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Only super administrators can manage featured stores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Your current role: {adminRole || 'Unknown'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Contact a super administrator to access featured stores management.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Featured Stores Management
          </CardTitle>
          <CardDescription>
            Manage which stores appear in the featured carousel across the platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add New Featured Store */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Featured Store
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('users')}
            >
              <User className="w-4 h-4 mr-2" />
              Users
            </Button>
            <Button
              variant={activeTab === 'distributors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('distributors')}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Distributors
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === 'users' ? (
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, first name, or last name..."
                  className="pl-10"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="distributor-search">Search Distributors</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="distributor-search"
                  value={distributorSearchQuery}
                  onChange={(e) => setDistributorSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or category..."
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {activeTab === 'users' ? (
            <>
              {searchLoading && searchQuery.length >= 2 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Searching users...</p>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {searchResults.map((user) => {
                    const isAlreadyFeatured = isUserAlreadyFeatured(user.id, 'user');
                    const displayName = getDisplayName(user);
                    const location = getLocationString(user);
                    const avatarInitial = getAvatarInitial(user);

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                              {avatarInitial}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{displayName}</p>
                              {user.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {user.rating && user.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{user.rating.toFixed(1)}</span>
                                </div>
                              )}
                              {user.total_sales && user.total_sales > 0 && (
                                <div className="flex items-center gap-1">
                                  <ShoppingBag className="h-3 w-3" />
                                  <span>{user.total_sales} sales</span>
                                </div>
                              )}
                              {location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAlreadyFeatured ? (
                            <Badge variant="secondary" className="text-xs">Already Featured</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addFeaturedStore.mutate({ 
                                userId: user.id, 
                                position: getNextAvailablePosition(),
                                type: 'user'
                              })}
                              disabled={addFeaturedStore.isPending}
                            >
                              {addFeaturedStore.isPending ? "Adding..." : "Add"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults && searchResults.length === 0 && !searchLoading && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No users found matching your search.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {distributorSearchLoading && distributorSearchQuery.length >= 2 && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Searching distributors...</p>
                </div>
              )}

              {distributorSearchResults && distributorSearchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {distributorSearchResults.map((distributor) => {
                    const isAlreadyFeatured = isUserAlreadyFeatured(distributor.id, 'distributor');
                    const location = distributor.city && distributor.region ? `${distributor.city}, ${distributor.region}` : distributor.region || distributor.city;

                    return (
                      <div
                        key={distributor.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                            {distributor.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{distributor.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Distributor
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{distributor.category}</span>
                              </div>
                              {location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAlreadyFeatured ? (
                            <Badge variant="secondary" className="text-xs">Already Featured</Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addFeaturedStore.mutate({ 
                                userId: distributor.id, 
                                position: getNextAvailablePosition(),
                                type: 'distributor'
                              })}
                              disabled={addFeaturedStore.isPending}
                            >
                              {addFeaturedStore.isPending ? "Adding..." : "Add"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {distributorSearchQuery.length >= 2 && distributorSearchResults && distributorSearchResults.length === 0 && !distributorSearchLoading && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No distributors found matching your search.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Featured Stores - Mobile Responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Current Featured Stores ({featuredStores?.length || 0}) - Mobile Optimized</CardTitle>
        </CardHeader>
        <CardContent>
          {featuredLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading featured stores...</p>
            </div>
          ) : !featuredStores || featuredStores.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No featured stores configured yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredStores.map((store) => {
                const profile = store.profiles;
                const distributorProfile = store.distributor_profiles;
                
                // For user stores
                if (profile) {
                  const displayName = getDisplayName(profile);
                  const location = getLocationString(profile);
                  const avatarInitial = getAvatarInitial(profile);

                  return (
                    <div
                      key={store.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 gap-3"
                    >
                      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs font-mono">
                            #{store.position}
                          </Badge>
                        </div>

                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={displayName}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold ring-2 ring-primary/20 shrink-0">
                            {avatarInitial}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-sm md:text-base truncate">{displayName}</h4>
                            {profile.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Verified</span>
                              </Badge>
                            )}
                            <Badge className="text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700">
                              <Crown className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Featured</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                            {profile.rating && profile.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{profile.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {profile.total_sales && profile.total_sales > 0 && (
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-3 w-3" />
                                <span className="hidden sm:inline">{profile.total_sales} sales</span>
                                <span className="sm:hidden">{profile.total_sales}</span>
                              </div>
                            )}
                            {location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[150px] md:max-w-none">{location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 justify-end md:justify-start">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`position-${store.id}`} className="text-xs text-muted-foreground">
                            Pos
                          </Label>
                          <Input
                            id={`position-${store.id}`}
                            type="number"
                            min="1"
                            value={store.position}
                            onChange={(e) => {
                              const newPosition = parseInt(e.target.value);
                              if (newPosition > 0) {
                                updatePosition.mutate({ storeId: store.id, newPosition });
                              }
                            }}
                            className="w-14 md:w-16 h-8 text-xs"
                            disabled={updatePosition.isPending}
                          />
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={removeFeaturedStore.isPending}
                              className="touch-target"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Featured Store</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{displayName}" from the featured stores? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeFeaturedStore.mutate(store.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                  );
                }

                // For distributor stores
                if (distributorProfile) {
                  const location = distributorProfile.city && distributorProfile.region
                    ? `${distributorProfile.city}, ${distributorProfile.region}` 
                    : distributorProfile.region || distributorProfile.city;

                  return (
                    <div
                      key={store.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 gap-3"
                    >
                      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs font-mono">
                            #{store.position}
                          </Badge>
                        </div>

                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold ring-2 ring-emerald-200 shrink-0">
                          {distributorProfile.name.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-sm md:text-base truncate">{distributorProfile.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Distributor</span>
                            </Badge>
                            <Badge className="text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700">
                              <Crown className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Featured</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{distributorProfile.category}</span>
                            </div>
                            {location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[150px] md:max-w-none">{location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 justify-end md:justify-start">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`position-${store.id}`} className="text-xs text-muted-foreground">
                            Pos
                          </Label>
                          <Input
                            id={`position-${store.id}`}
                            type="number"
                            min="1"
                            value={store.position}
                            onChange={(e) => {
                              const newPosition = parseInt(e.target.value);
                              if (newPosition > 0) {
                                updatePosition.mutate({ storeId: store.id, newPosition });
                              }
                            }}
                            className="w-14 md:w-16 h-8 text-xs"
                            disabled={updatePosition.isPending}
                          />
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={removeFeaturedStore.isPending}
                              className="touch-target"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Featured Store</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{distributorProfile.name}" from the featured stores? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeFeaturedStore.mutate(store.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};