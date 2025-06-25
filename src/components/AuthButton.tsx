
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useAuthStore } from "@/stores/authStore";
import { LoginDialog } from "./LoginDialog";
import { User, LogOut } from "lucide-react";

export const AuthButton = () => {
  const { user, logout, isLoading } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <User className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <LoadingButton
        variant="outline"
        onClick={handleLogout}
        loading={isLoggingOut}
        loadingText="Signing out..."
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </LoadingButton>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowLogin(true)}>
        <User className="w-4 h-4 mr-2" />
        Sign In
      </Button>
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};
