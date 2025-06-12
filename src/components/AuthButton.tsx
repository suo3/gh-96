
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

  if (!isAuthenticated || !user) {
    return (
      <Button onClick={onLogin} variant="outline">
        Login
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          {user.membershipType === 'premium' && (
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
            <div className="flex items-center gap-2">
              <Badge variant={user.membershipType === 'premium' ? 'default' : 'secondary'}>
                {user.membershipType}
              </Badge>
              {user.membershipType === 'free' && (
                <span className="text-xs text-muted-foreground">
                  {user.monthlyListings}/10 listings, {user.monthlySwaps}/20 swaps
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
        <DropdownMenuItem onClick={() => console.log('Premium upgrade')}>
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
