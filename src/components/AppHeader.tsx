
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Plus, Filter, Navigation, RotateCcw } from "lucide-react";
import { ViewToggle } from "@/components/ViewToggle";
import { AuthButton } from "@/components/AuthButton";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";

interface AppHeaderProps {
  userLocation: string;
  displayMode: "swipe" | "grid" | "list";
  showFilters: boolean;
  onDisplayModeChange: (mode: "swipe" | "grid" | "list") => void;
  onToggleFilters: () => void;
  onLocationDetect: () => Promise<void>;
  onPostItem: () => void;
}

export const AppHeader = ({
  userLocation,
  displayMode,
  showFilters,
  onDisplayModeChange,
  onToggleFilters,
  onLocationDetect,
  onPostItem
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const { totalUnreadCount } = useMessageStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">SwapBoard</h1>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {userLocation}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLocationDetect}
                  className="ml-2 h-6 px-2 text-xs hover:bg-emerald-100"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Update
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ViewToggle currentView={displayMode} onViewChange={onDisplayModeChange} />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFilters}
              className={`${showFilters ? 'bg-emerald-100 text-emerald-600' : ''}`}
            >
              <Filter className="w-5 h-5" />
            </Button>
            
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="relative"
              >
                <MessageCircle className="w-5 h-5" />
                {totalUnreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                    {totalUnreadCount}
                  </Badge>
                )}
              </Button>
            )}
            
            <AuthButton />
            
            <Button
              onClick={onPostItem}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Item
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
