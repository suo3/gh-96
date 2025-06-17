
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Eye } from "lucide-react";
import { UserRatingDisplay } from "./UserRatingDisplay";

interface ItemListProps {
  items: any[];
  onItemLike: (item: any) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-600">Try adjusting your filters or check back later for new listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex">
              {/* Image */}
              <div className="w-48 h-32 bg-gray-100 flex-shrink-0">
                <img
                  src={item.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">{item.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 hover:bg-red-50"
                      onClick={() => onItemLike(item)}
                      disabled={item.hasActiveMessage}
                    >
                      <Heart className={`w-4 h-4 ${item.hasActiveMessage ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="secondary">{item.condition}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2 mt-3">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
