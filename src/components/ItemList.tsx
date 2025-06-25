
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, MessageCircle, Eye } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";
import { Listing, useListingStore } from "@/stores/listingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useToast } from "@/hooks/use-toast";
import { UserRatingDisplay } from "./UserRatingDisplay";

interface ItemListProps {
  items: Listing[];
  onItemLike: (item: Listing) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { createConversationFromSwipe, checkListingHasActiveConversation } = useMessageStore();
  const { user } = useAuthStore();
  const { fetchUserRatings, getAverageRating } = useRatingStore();
  const { minRating, updateListingConversationStatus } = useListingStore();
  const { toast } = useToast();

  // Fetch ratings for all users when items change
  useEffect(() => {
    const userIds = [...new Set(items.map(item => item.user_id).filter(Boolean))];
    userIds.forEach(userId => {
      if (userId) {
        fetchUserRatings(userId);
      }
    });
  }, [items, fetchUserRatings]);

  // Apply rating filter at component level
  const filteredByRating = items.filter((item) => {
    if (minRating <= 0) return true;
    if (!item.user_id) return true; // Keep items without user_id
    const userRating = getAverageRating(item.user_id);
    return userRating >= minRating;
  });

  const handleDetailsClick = (item: Listing) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleSwapClick = async (item: Listing) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start a conversation.",
        variant: "destructive"
      });
      return;
    }

    if (item.user_id === user.id) {
      toast({
        title: "Cannot swap with yourself",
        description: "You cannot start a conversation about your own listing.",
        variant: "destructive"
      });
      return;
    }

    // Check if listing already has an active conversation
    const hasActiveConversation = await checkListingHasActiveConversation(item.id);
    if (hasActiveConversation) {
      toast({
        title: "Conversation already exists",
        description: "This item already has an active conversation.",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversationId = await createConversationFromSwipe(
        item.id,
        item.title,
        item.user_id || ''
      );

      if (conversationId) {
        // Update the conversation status for this listing
        updateListingConversationStatus(item.id, true);
        
        // Update the item to show it has an active message
        onItemLike({ ...item, hasActiveMessage: true });
        
        toast({
          title: "Conversation Started!",
          description: `Started a conversation about "${item.title}".`,
        });
      } else {
        toast({
          title: "Failed to start conversation",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getItemImage = (item: Listing) => {
    if (item.images && item.images.length > 0 && item.images[0]) {
      return item.images[0];
    }
    return "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
  };

  const getUserDisplayName = (item: Listing) => {
    return item.profiles?.first_name || item.profiles?.username || 'User';
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

  return (
    <>
      <div className="space-y-4">
        {filteredByRating.map((item) => {
          return (
            <Card 
              key={item.id} 
              className={`hover:shadow-lg transition-shadow border-emerald-200 ${
                item.hasActiveMessage ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={getItemImage(item)}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.location || "Location not specified"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-emerald-600">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-200">
                          {item.condition}
                        </Badge>
                        {item.hasActiveMessage && (
                          <Badge className="bg-blue-600 text-white">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Active Chat
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                            {getUserAvatar(item)}
                          </div>
                          <div className="text-sm text-gray-900">
                            {getUserDisplayName(item)}
                          </div>
                        </div>
                        {item.user_id && (
                          <UserRatingDisplay userId={item.user_id} size="sm" />
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          {item.views || 0}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDetailsClick(item)}
                          className="border-emerald-200"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className={`${
                            item.hasActiveMessage 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                          }`}
                          onClick={() => handleSwapClick(item)}
                          disabled={item.hasActiveMessage}
                        >
                          {item.hasActiveMessage ? (
                            <>
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Active Chat
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 mr-1" />
                              Swap
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ItemDetailModal
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onItemLike={handleSwapClick}
      />
    </>
  );
};
