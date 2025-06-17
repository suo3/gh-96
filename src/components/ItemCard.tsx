
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, User } from "lucide-react";
import { UserRatingDisplay } from "./UserRatingDisplay";

interface ItemCardProps {
  item: any;
  onLike: (item: any) => void;
  compact?: boolean;
}

export const ItemCard = ({ item, onLike, compact = false }: ItemCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        <img
          src={item.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white"
          onClick={() => onLike(item)}
          disabled={item.hasActiveMessage}
        >
          <Heart className={`w-4 h-4 ${item.hasActiveMessage ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline">{item.category}</Badge>
          <Badge variant="secondary">{item.condition}</Badge>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{item.location}</span>
          {item.distance && (
            <span className="text-emerald-600 font-medium">
              • {item.distance} miles
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {item.profiles?.avatar || item.profiles?.first_name?.[0] || 'U'}
            </div>
            <span className="text-sm font-medium">
              {item.profiles?.first_name || item.profiles?.username || 'User'}
            </span>
          </div>
          {item.user_id && (
            <UserRatingDisplay userId={item.user_id} compact />
          )}
        </div>
        
        {item.wanted_items && item.wanted_items.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Looking for:</p>
            <p className="text-sm text-gray-700 line-clamp-1">
              {item.wanted_items.join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
