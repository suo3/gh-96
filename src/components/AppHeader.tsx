
import { useState } from "react";
import { MapPin, Plus, Bell, User, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AuthButton } from "./AuthButton";
import { LocationInput } from "./LocationInput";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Location {
  latitude: number;
  longitude: number;
}

interface AppHeaderProps {
  userLocation: Location | null;
  onLocationDetect: () => void;
  onPostItem: () => void;
}

export const AppHeader = ({ userLocation, onLocationDetect, onPostItem }: AppHeaderProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const { totalUnreadCount } = useMessageStore();
  const navigate = useNavigate();
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationValue, setLocationValue] = useState("");

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc('is_admin');
      return data || false;
    },
    enabled: !!user?.id
  });

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleMessages = () => {
    navigate("/messages");
  };

  const handleAdmin = () => {
    navigate("/admin");
  };

  const handleLocationSubmit = () => {
    if (locationValue.trim()) {
      console.log('Location set:', locationValue);
      setShowLocationInput(false);
      setLocationValue("");
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-emerald-600">SwapBoard</h1>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {user?.location ? (
              <span className="font-medium">{user.location}</span>
            ) : userLocation ? (
              <span className="font-medium">Location detected</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput(true)}
                className="text-gray-600 hover:text-emerald-600"
              >
                Set location
              </Button>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Coins Display */}
                <div className="hidden sm:flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-3 py-1.5">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-700">{user?.coins || 0}</span>
                  <span className="text-yellow-600 text-xs font-medium">coins</span>
                </div>

                {/* Messages Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMessages}
                  className="relative text-gray-600 hover:text-emerald-600"
                >
                  <Bell className="w-4 h-4" />
                  {totalUnreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                    >
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </Badge>
                  )}
                  <span className="ml-1 hidden sm:inline">Messages</span>
                </Button>

                {/* Post Item Button */}
                <Button
                  onClick={onPostItem}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Post Item</span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                        <AvatarFallback>
                          {user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          @{user?.username}
                        </p>
                        <div className="flex items-center gap-2 sm:hidden">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-2 py-1">
                            <Coins className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs font-semibold text-yellow-700">{user?.coins || 0}</span>
                            <span className="text-yellow-600 text-xs">coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMessages} className="sm:hidden">
                      <Bell className="mr-2 h-4 w-4" />
                      Messages
                      {totalUnreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {totalUnreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={handleAdmin}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AuthButton />
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <AuthButton />
            )}
          </div>
        </div>
      </div>

      {/* Location Input Modal */}
      {showLocationInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Set Your Location</h3>
            <LocationInput
              value={locationValue}
              onChange={setLocationValue}
              placeholder="Enter your location"
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleLocationSubmit} className="flex-1">
                Set Location
              </Button>
              <Button onClick={onLocationDetect} variant="outline">
                Detect
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLocationInput(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
