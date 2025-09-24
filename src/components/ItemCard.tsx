import { Heart, MapPin, MessageCircle, MoreVertical, MessageSquare, Star, Crown, Megaphone, Flag, ChevronLeft, ChevronRight, User } from "lucide-react";
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
import { useRatingStore } from "@/stores/ratingStore";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useState, useEffect } from "react";
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
  const { fetchUserRatings } = useRatingStore();
  const { settings } = usePlatformSettings();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch ratings for the item owner
  useEffect(() => {
    if (item.user_id) {
      fetchUserRatings(item.user_id);
    }
  }, [item.user_id, fetchUserRatings]);

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
    // Always use toggleFavorite for heart icon - this adds to favorites
    await toggleFavorite(item.id);
  };

  const images = item.images || ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"];
  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => prev === images.length - 1 ? 0 : prev + 1);
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (item.user_id) {
      navigate(`/user/${item.user_id}`);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-primary/50">
      <div className="cursor-pointer" onClick={handleItemClick}>
        <div className="relative overflow-hidden">
          <img
            src={currentImage}
            alt={`${item.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-48 object-cover transition-opacity duration-300"
          />
          
          {/* Image Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-black/60 hover:bg-black/80 text-white border-0"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 bg-black/60 hover:bg-black/80 text-white border-0"
                onClick={handleNextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
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
                {user?.id === item.user_id && settings.enablePromotions && (
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
        
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base md:text-lg line-clamp-2 flex-1">{item.title}</h3>
            {item.condition && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {item.condition}
              </Badge>
            )}
          </div>
          
          {item.price && (
            <span className="text-base md:text-lg font-bold text-emerald-600 block mt-1">
              ₵{item.price.toFixed(2)}
            </span>
          )}
          
          <div className="flex items-center text-xs md:text-sm text-gray-600 mt-2">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
            <span className="truncate">{item.location || "Location not specified"}</span>
          </div>

          {/* Owner and Rating Section */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              {item.user_id && (
                <UserRatingDisplay userId={item.user_id} showCount={false} size="sm" />
              )}
            </div>
            
            {item.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOwnerClick}
                className="text-primary hover:text-primary/80 p-1 h-auto shrink-0"
              >
                <User className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-xs hidden sm:inline">View Seller</span>
                <span className="text-xs sm:hidden">Seller</span>
              </Button>
            )}
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