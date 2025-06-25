
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/AuthButton";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Plus, MapPin, Shield, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AppHeaderProps {
  userLocation?: { latitude: number; longitude: number } | null;
  onLocationDetect?: () => void;
  onPostItem?: () => void;
}

export const AppHeader = ({ userLocation, onLocationDetect, onPostItem }: AppHeaderProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const { data: adminCheck } = await supabase.rpc('is_admin');
        setIsAdmin(!!adminCheck);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  const isHomePage = location.pathname === "/";
  const isMessagesPage = location.pathname === "/messages";
  const isProfilePage = location.pathname === "/profile";
  const isAdminPage = location.pathname === "/admin";

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate("/")}
            >
              SwapBoard
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {!isHomePage && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            )}
            
            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/messages")}
                  className={`flex items-center gap-2 ${isMessagesPage ? 'bg-emerald-100 text-emerald-700' : ''}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/profile")}
                  className={`flex items-center gap-2 ${isProfilePage ? 'bg-emerald-100 text-emerald-700' : ''}`}
                >
                  Profile
                </Button>

                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/admin")}
                    className={`flex items-center gap-2 ${isAdminPage ? 'bg-emerald-100 text-emerald-700' : ''}`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {isAuthenticated && onPostItem && (
              <Button onClick={onPostItem} size="sm" className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" />
                Post Item
              </Button>
            )}
            
            {isAuthenticated && onLocationDetect && !userLocation && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLocationDetect}
                className="hidden sm:flex"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Set Location
              </Button>
            )}
            
            <AuthButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden mt-4 flex justify-around border-t border-emerald-100 pt-4">
            {!isHomePage && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/")}
                className="flex flex-col items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span className="text-xs">Home</span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/messages")}
              className={`flex flex-col items-center gap-1 ${isMessagesPage ? 'bg-emerald-100 text-emerald-700' : ''}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Messages</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/profile")}
              className={`flex flex-col items-center gap-1 ${isProfilePage ? 'bg-emerald-100 text-emerald-700' : ''}`}
            >
              <span className="text-xs">Profile</span>
            </Button>

            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/admin")}
                className={`flex flex-col items-center gap-1 ${isAdminPage ? 'bg-emerald-100 text-emerald-700' : ''}`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs">Admin</span>
              </Button>
            )}
            
            {onPostItem && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onPostItem}
                className="flex flex-col items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">Post</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
