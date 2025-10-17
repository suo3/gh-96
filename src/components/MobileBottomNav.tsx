import { Home, ShoppingBag, MessageCircle, User, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.user);
  const conversations = useMessageStore((state) => state.conversations);
  const unreadCount = conversations.filter(c => c.unread > 0).length;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ShoppingBag, label: "Browse", path: "/marketplace" },
    { icon: MessageCircle, label: "Messages", path: "/messages", badge: unreadCount },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: User, label: "You", path: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border/40 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] pb-safe">
      <div className="flex items-stretch h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 transition-all duration-200",
                "active:scale-95 active:bg-muted/30"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    active ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-[2]"
                  )} 
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-semibold leading-none">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors leading-none",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
