
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, MessageCircle, Eye, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ItemDetailModal } from "./ItemDetailModal";
import { Listing, useListingStore } from "@/stores/listingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useToast } from "@/hooks/use-toast";
import { UserRatingDisplay } from "./UserRatingDisplay";
import { useFavorites } from "@/hooks/useFavorites";

interface ItemListProps {
  items: Listing[];
  onItemLike: (item: Listing) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  const navigate = useNavigate();
  const { createConversationFromSwipe, checkListingHasActiveConversation } = useMessageStore();
  const { user } = useAuthStore();
  const { fetchUserRatings, getAverageRating } = useRatingStore();
  const { minRating, updateListingConversationStatus } = useListingStore();
  const { toast } = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();

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
    navigate(`/item/${item.id}`);
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

  const handleFavoriteClick = async (e: React.MouseEvent, item: Listing) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Heart icon clicked for item:', item.id);
    await toggleFavorite(item.id);
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
                  <div className="relative">
                    <img
                      src={getItemImage(item)}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
                      }}
                    />
                    {/* Favorites heart button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`absolute -top-1 -right-1 w-6 h-6 p-0 ${
                        isFavorited(item.id) 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-white hover:bg-gray-100 text-gray-600'
                      }`}
                      onClick={(e) => handleFavoriteClick(e, item)}
                    >
                      <Heart className={`w-3 h-3 ${isFavorited(item.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          {item.price && (
                            <span className="text-lg font-bold text-emerald-600 ml-2">
                              ₵{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                              disabled={item.hasActiveMessage}
                            >
                              {item.hasActiveMessage ? (
                                <>
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Active Chat
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Contact
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.profiles?.phone_number ? (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                const phoneNumber = item.profiles?.phone_number;
                                console.log('Phone number found:', phoneNumber);
                                if (!phoneNumber) return;
                                const digits = phoneNumber.replace(/\D/g, '');
                                const formattedPhone = digits.startsWith('0') ? '233' + digits.substring(1) : digits.startsWith('233') ? digits : digits.length === 9 ? '233' + digits : digits;
                                const message = encodeURIComponent(`Hi! I'm interested in your item "${item.title}" on the marketplace. Is it still available?`);
                                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
                                window.open(whatsappUrl, '_blank');
                              }}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact on WhatsApp
                              </DropdownMenuItem>
                            ) : (
                              <div className="px-4 py-2 text-sm text-gray-500">
                                No WhatsApp number available
                              </div>
                            )}
                            <DropdownMenuItem onClick={() => handleSwapClick(item)}>
                              <Heart className="w-4 h-4 mr-2" />
                              Message in App
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </>
  );
};
