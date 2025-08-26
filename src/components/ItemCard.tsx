
import { Heart, MapPin, MessageCircle, MoreVertical, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Listing } from "@/stores/listingStore";
import { UserRatingDisplay } from "./UserRatingDisplay";
import { ReportListingDialog } from "./ReportListingDialog";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ItemCardProps {
  item: Listing;
  onItemClick?: (item: Listing) => void;
  onItemLike?: (item: Listing) => void;
}

export const ItemCard = ({ item, onItemClick, onItemLike }: ItemCardProps) => {
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleItemClick = () => {
    console.log('handleItemClick called', item.id);
    if (onItemClick) {
      onItemClick(item);
    } else {
      console.log('Navigating to:', `/item/${item.id}`);
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

  const getUserDisplayName = (item: Listing) => {
    return item.profiles?.first_name || item.profiles?.username || 'Anonymous User';
  };

  const getUserAvatar = (item: Listing) => {
    if (item.profiles?.first_name) {
      return item.profiles.first_name.charAt(0).toUpperCase();
    }
    if (item.profiles?.username) {
      return item.profiles.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const formatPhoneForWhatsApp = (phoneNumber: string) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 233 (Ghana country code)
    if (digits.startsWith('0')) {
      return '233' + digits.substring(1);
    }
    
    // If starts with 233, use as is
    if (digits.startsWith('233')) {
      return digits;
    }
    
    // If 9 digits, assume it's without country code
    if (digits.length === 9) {
      return '233' + digits;
    }
    
    return digits;
  };

  const openWhatsApp = () => {
    const phoneNumber = item.profiles?.phone_number;
    if (!phoneNumber) return;
    
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const message = encodeURIComponent(`Hi! I'm interested in your item "${item.title}" on the marketplace. Is it still available?`);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getItemImages = (item: Listing) => {
    if (item.images && item.images.length > 0) {
      return item.images.filter(img => img && img.trim() !== '');
    }
    return [];
  };

  const images = getItemImages(item);
  const firstImage = images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Main clickable area */}
      <div className="cursor-pointer" onClick={handleItemClick}>
        <div className="relative">
          <img
            src={firstImage}
            alt={item.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
            }}
          />
          {/* Favorite button */}
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

          {item.hasActiveMessage && (
            <Badge className="absolute top-2 right-12 bg-blue-600">
              <MessageCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          
          {/* More options menu */}
          <div className="absolute top-2 left-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="sm" className="w-8 h-8 p-0 bg-white/80 hover:bg-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setShowReportDialog(true);
                }}>
                  Report listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg line-clamp-2 flex-1">{item.title}</h3>
                {item.price && (
                  <span className="text-lg font-bold text-emerald-600 ml-2">
                    ₵{item.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {item.description || "No description provided."}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-600 text-xs">
                {item.category}
              </Badge>
              <Badge variant="outline" className="border-emerald-200 text-xs">
                {item.condition}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location || "Location not specified"}
            </div>

            {/* Owner info and rating */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                  {getUserAvatar(item)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getUserDisplayName(item)}
                </span>
              </div>
              
              {item.user_id && (
                <UserRatingDisplay userId={item.user_id} size="sm" />
              )}
            </div>
          </div>
        </CardContent>
      </div>
      
      {/* Action buttons - not clickable for main navigation */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              console.log('View Details clicked for item:', item.id);
              handleItemClick();
            }}
            variant="outline" 
            className="flex-1"
          >
            View Details
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {item.profiles?.phone_number && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  openWhatsApp();
                }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact on WhatsApp
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                if (onItemLike) {
                  onItemLike(item);
                } else {
                  navigate('/messages');
                }
              }}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message in App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <ReportListingDialog
          listingId={item.id}
          listingTitle={item.title}
        />
      )}
    </Card>
  );
};
