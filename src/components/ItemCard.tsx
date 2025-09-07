import { Heart, MapPin, MessageCircle, MoreVertical, MessageSquare, Star, Crown, Megaphone, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Listing } from "@/stores/listingStore";
import { UserRatingDisplay } from "./UserRatingDisplay";
import { ReportListingDialog } from "./ReportListingDialog";
import { PromoteItemDialog } from "./PromoteItemDialog";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ItemCardProps {
  item: Listing;
  onItemClick?: (item: Listing) => void;
  onItemLike?: (item: Listing) => void;
}

export const ItemCard = ({ item, onItemClick, onItemLike }: ItemCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(`/item/${item.id}`);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onItemLike) {
      onItemLike(item);
    } else {
      await toggleFavorite(item.id);
    }
  };

  const firstImage = item.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="cursor-pointer" onClick={handleItemClick}>
        <div className="relative">
          <img
            src={firstImage}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <Button
            variant="secondary"
            size="sm"
            className={`absolute top-2 right-2 w-8 h-8 p-0 ${
              isFavorited(item.id) 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white/80 hover:bg-white text-gray-600'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`w-4 h-4 ${isFavorited(item.id) ? 'fill-current' : ''}`} />
          </Button>
          
          <div className="absolute top-2 left-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/80 hover:bg-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {user?.id === item.user_id && (
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <PromoteItemDialog listingId={item.id}>
                      <div className="flex items-center w-full">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Promote Item
                      </div>
                    </PromoteItemDialog>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setShowReportDialog(true);
                }}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
          {item.price && (
            <span className="text-lg font-bold text-emerald-600">
              ₵{item.price.toFixed(2)}
            </span>
          )}
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            {item.location || "Location not specified"}
          </div>
        </CardContent>
      </div>

      {showReportDialog && (
        <ReportListingDialog
          listingId={item.id}
          listingTitle={item.title}
        />
      )}
    </Card>
  );
};