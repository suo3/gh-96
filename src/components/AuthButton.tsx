
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { User, LogOut, Settings, Crown } from "lucide-react";

interface AuthButtonProps {
  onLogin: () => void;
  onProfile: () => void;
}

export const AuthButton = ({ onLogin, onProfile }: AuthButtonProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUpgrade = () => {
    console.log('Premium upgrade clicked');
    // TODO: Implement premium upgrade flow
  };

  if (!isAuthenticated || !user) {
    return (
      <Button onClick={onLogin} variant="outline">
        Login
      </Button>
    );
  }

  // Use auth store user data
  const displayName = user.firstName && user.lastName ? 
    `${user.firstName} ${user.lastName}`.trim() : 
    user.username || 'User';
  
  const username = user.username || 'user';
  const avatar = user.avatar || displayName.charAt(0).toUpperCase();
  const membershipType = user.membershipType || 'free';
  const monthlyListings = user.monthlyListings || 0;
  const monthlySwaps = user.monthlySwaps || 0;

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
