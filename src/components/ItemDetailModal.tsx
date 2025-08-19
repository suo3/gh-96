
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, MessageCircle, X, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Listing } from "@/stores/listingStore";
import { UserRatingDisplay } from "./UserRatingDisplay";
import { ReportListingDialog } from "./ReportListingDialog";

interface ItemDetailModalProps {
  item: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onItemLike: (item: Listing) => void;
  onStartConversation: (item: Listing) => void;
}

export const ItemDetailModal = ({ 
  item, 
  isOpen, 
  onClose, 
  onItemLike, 
  onStartConversation 
}: ItemDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item]);

  if (!item) return null;

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
  const displayImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 bg-white/80 hover:bg-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image Gallery */}
          <div className="relative">
            <img
              src={displayImages[currentImageIndex]}
              alt={item.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop";
              }}
            />
            
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 flex-1">{item.title}</h2>
                  {item.price && (
                    <span className="text-2xl font-bold text-emerald-600 ml-4">
                      ₵{item.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-emerald-600">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="border-emerald-200">
                    {item.condition}
                  </Badge>
                  {item.hasActiveMessage && (
                    <Badge className="bg-blue-600">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Active Chat
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </div>

              {/* Location */}
              {item.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{item.location}</span>
                </div>
              )}

              {/* Wanted Items */}
              {item.wanted_items && item.wanted_items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Looking for</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.wanted_items.map((wantedItem, index) => (
                      <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                        {wantedItem}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {getUserAvatar(item)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getUserDisplayName(item)}
                    </p>
                    <p className="text-sm text-gray-600">Item Owner</p>
                  </div>
                </div>
                
                {item.user_id && (
                  <UserRatingDisplay userId={item.user_id} size="md" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* WhatsApp contact button - only show if seller has phone number */}
                {item.profiles?.phone_number && (
                  <Button
                    onClick={openWhatsApp}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact on WhatsApp
                  </Button>
                )}
                
                <Button
                  onClick={() => onItemLike(item)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Interested
                </Button>
                <Button
                  onClick={() => onStartConversation(item)}
                  variant="outline"
                  className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
                <ReportListingDialog 
                  listingId={item.id} 
                  listingTitle={item.title}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
