
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Listing } from "@/stores/listingStore";
import { UserRatingDisplay } from "./UserRatingDisplay";

interface ItemCardProps {
  item: Listing;
  onItemClick: (item: Listing) => void;
  onItemLike: (item: Listing) => void;
}

export const ItemCard = ({ item, onItemClick, onItemLike }: ItemCardProps) => {
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

  const getItemImages = (item: Listing) => {
    if (item.images && item.images.length > 0) {
      return item.images.filter(img => img && img.trim() !== '');
    }
    return [];
  };

  const images = getItemImages(item);
  const firstImage = images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={() => onItemClick(item)}>
        <div className="relative">
          <img
            src={firstImage}
            alt={item.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
            }}
          />
          {item.hasActiveMessage && (
            <Badge className="absolute top-2 right-2 bg-blue-600">
              <MessageCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
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
              
              {item.userId && (
                <UserRatingDisplay userId={item.userId} size="sm" />
              )}
            </div>
          </div>
        </CardContent>
      </div>
      
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onItemLike(item);
          }}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>Interested</span>
        </button>
      </div>
    </Card>
  );
};
