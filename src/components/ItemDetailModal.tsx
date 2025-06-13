
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star, MessageCircle, Eye } from "lucide-react";
import { Listing } from "@/stores/listingStore";

interface ItemDetailModalProps {
  item: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemLike: (item: Listing) => void;
}

export const ItemDetailModal = ({ item, open, onOpenChange, onItemLike }: ItemDetailModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Images */}
          {item.images && item.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${item.title} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )) || (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
          )}

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
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="ml-1">(4.0)</span>
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
                  {item.profiles?.first_name?.charAt(0) || item.profiles?.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {item.profiles?.first_name && item.profiles?.last_name 
                      ? `${item.profiles.first_name} ${item.profiles.last_name}`
                      : item.profiles?.username || 'Anonymous User'
                    }
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
                onClick={() => !item.hasActiveMessage && onItemLike(item)}
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
