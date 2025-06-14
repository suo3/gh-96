import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star, MessageCircle, Eye } from "lucide-react";
import { Listing } from "@/stores/listingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useListingStore } from "@/stores/listingStore";
import { useToast } from "@/hooks/use-toast";

interface ItemDetailModalProps {
  item: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemLike: (item: Listing) => void;
}

export const ItemDetailModal = ({ item, open, onOpenChange, onItemLike }: ItemDetailModalProps) => {
  const { createConversationFromSwipe } = useMessageStore();
  const { user } = useAuthStore();
  const { fetchUserRatings, getAverageRating } = useRatingStore();
  const { incrementViews } = useListingStore();
  const { toast } = useToast();

  // Fetch ratings when item changes
  useEffect(() => {
    if (item?.user_id) {
      fetchUserRatings(item.user_id);
    }
  }, [item?.user_id, fetchUserRatings]);

  // Increment views when modal opens and item is present
  useEffect(() => {
    if (open && item?.id && user?.id !== item.user_id) {
      // Only increment views if the user is not the owner of the item
      incrementViews(item.id);
    }
  }, [open, item?.id, item?.user_id, user?.id, incrementViews]);

  if (!item) return null;

  const handleSwapClick = async () => {
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

    if (item.hasActiveMessage) {
      return;
    }

    try {
      const conversationId = await createConversationFromSwipe(
        item.id,
        item.title,
        item.user_id || ''
      );

      if (conversationId) {
        // Update the item to show it has an active message
        onItemLike(item);
        
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

  const getItemImages = (item: Listing) => {
    if (item.images && item.images.length > 0) {
      return item.images.filter(img => img && img.trim() !== '');
    }
    return [];
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

  const getUserRating = (userId: string | undefined) => {
    if (!userId) return 0;
    return getAverageRating(userId);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const images = getItemImages(item);
  const userRating = getUserRating(item.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.length > 0 ? (
              images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop";
                  }}
                />
              ))
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-600">
                {item.category}
              </Badge>
              <Badge variant="outline" className="border-emerald-200">
                {item.condition}
              </Badge>
              {item.hasActiveMessage && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message Sent
                </Badge>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location || "Location not specified"}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {item.views || 0} views
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {item.likes || 0} likes
              </div>
              <div className="flex items-center">
                {renderStars(userRating)}
                <span className="ml-1">
                  {userRating > 0 ? `(${userRating})` : '(No ratings)'}
                </span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {item.description || "No description provided."}
            </p>

            {/* Wanted Items */}
            {item.wanted_items && item.wanted_items.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Looking for:</h4>
                <div className="flex flex-wrap gap-2">
                  {item.wanted_items.map((wantedItem, index) => (
                    <Badge key={index} variant="outline" className="border-emerald-200">
                      {wantedItem}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {getUserAvatar(item)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {getUserDisplayName(item)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Listed {new Date(item.created_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <Button
                className={`${
                  item.hasActiveMessage 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                }`}
                onClick={handleSwapClick}
                disabled={item.hasActiveMessage}
              >
                {item.hasActiveMessage ? (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Sent
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Swap
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
