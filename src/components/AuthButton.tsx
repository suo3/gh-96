
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { User, LogOut, Settings, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthButtonProps {
  onLogin: () => void;
  onProfile: () => void;
}

interface UserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  membership_type?: string;
  monthly_listings?: number;
  monthly_swaps?: number;
  total_swaps?: number;
  rating?: number;
}

export const AuthButton = ({ onLogin, onProfile }: AuthButtonProps) => {
  const { user, session, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user && isAuthenticated) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [session?.user, isAuthenticated]);

  const fetchUserProfile = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUpgrade = () => {
    console.log('Premium upgrade clicked');
    // TODO: Implement premium upgrade flow
  };

  if (!isAuthenticated || !session?.user) {
    return (
      <Button onClick={onLogin} variant="outline">
        Login
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button variant="ghost" className="h-10 w-10 rounded-full" disabled>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
            ...
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Use profile data if available, fallback to session user data
  const displayName = profile ? 
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'User' :
    session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  
  const username = profile?.username || session.user.email?.split('@')[0] || 'user';
  const avatar = profile?.avatar || displayName.charAt(0).toUpperCase();
  const membershipType = profile?.membership_type || 'free';
  const monthlyListings = profile?.monthly_listings || 0;
  const monthlySwaps = profile?.monthly_swaps || 0;

  // Calculate limits based on membership
  const listingLimit = membershipType === 'premium' ? '∞' : '10';
  const swapLimit = membershipType === 'premium' ? '∞' : '20';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
              {avatar}
            </AvatarFallback>
          </Avatar>
          {membershipType === 'premium' && (
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">@{username}</p>
            <div className="flex items-center gap-2">
              <Badge variant={membershipType === 'premium' ? 'default' : 'secondary'}>
                {membershipType}
              </Badge>
              {membershipType === 'free' && (
                <span className="text-xs text-muted-foreground">
                  {monthlyListings}/{listingLimit} listings, {monthlySwaps}/{swapLimit} swaps
                </span>
              )}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfile}>
          <User className="mr-2 h-4 w-4" />
          Profile & Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpgrade}>
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
