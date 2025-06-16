
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star } from "lucide-react";
import { useMessageStore } from "@/stores/messageStore";
import { UserRating } from "./UserRating";

interface Item {
  id: string;
  title: string;
  description?: string; // Made optional to match Listing type
  category: string;
  condition: string;
  images?: string[]; // Made optional to match Listing type
  user_id?: string; // Made optional to match Listing type
  location: string;
  wanted_items: string[];
  status: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  distance?: number;
}

interface ItemListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

export const ItemList = ({ items, onItemClick }: ItemListProps) => {
  const [showRating, setShowRating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { hasActiveMessage, createConversationFromSwipe } = useMessageStore();

  const handleSwapClick = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    
    if (hasActiveMessage(item.title)) return;
    
    const userName = item.profiles 
      ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || item.profiles.username || 'Anonymous'
      : 'Anonymous';
      
    await createConversationFromSwipe(item.id, item.title, item.user_id || '');
    setSelectedItem(item);
    setShowRating(true);
  };

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => {
          const isDisabled = hasActiveMessage(item.title);
          const userName = item.profiles 
            ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || item.profiles.username || 'Anonymous'
            : 'Anonymous';

          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border-emerald-200"
              onClick={() => onItemClick(item)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-48 h-32 relative flex-shrink-0">
                    <img
                      src={item.images?.[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                    {item.distance && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700 text-xs">
                        {item.distance.toFixed(1)} mi
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-200">
                          {item.condition}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-900 mb-1">Looking for:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.wanted_items.slice(0, 4).map((wanted, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-emerald-200">
                            {wanted}
                          </Badge>
                        ))}
                        {item.wanted_items.length > 4 && (
                          <Badge variant="outline" className="text-xs border-emerald-200">
                            +{item.wanted_items.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{userName}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2 h-2 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">(4.0)</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={(e) => handleSwapClick(e, item)}
                        disabled={isDisabled}
                        className={`${
                          isDisabled 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                        } text-white`}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {isDisabled ? 'Contacted' : 'Swap'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedItem && (
        <UserRating
          open={showRating}
          onOpenChange={setShowRating}
          ratedUserId={selectedItem.user_id || ''}
          ratedUserName={selectedItem.profiles 
            ? `${selectedItem.profiles.first_name || ''} ${selectedItem.profiles.last_name || ''}`.trim() || selectedItem.profiles.username || 'Anonymous'
            : 'Anonymous'}
          itemTitle={selectedItem.title}
        />
      )}
    </>
  );
};
