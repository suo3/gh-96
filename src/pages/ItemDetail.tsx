import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, MessageCircle, ChevronLeft, ChevronRight, MessageSquare, Star, ArrowLeft } from "lucide-react";
import { Listing, useListingStore } from "@/stores/listingStore";
import { UserRatingDisplay } from "@/components/UserRatingDisplay";
import { ReportListingDialog } from "@/components/ReportListingDialog";
import { UserRating } from "@/components/UserRating";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { generatePageTitle, generateMetaDescription } from "@/constants/seo";

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { incrementViews } = useListingStore();
  
  const [item, setItem] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItemDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (item && user) {
      checkIfFavorited();
    }
  }, [item, user]);

  const fetchItemDetails = async (itemId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            first_name,
            last_name,
            username,
            avatar,
            phone_number
          )
        `)
        .eq('id', itemId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching item:', error);
        toast({
          title: "Error",
          description: "Item not found or no longer available.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setItem(data);
      
      // Increment view count
      if (data) {
        incrementViews(data.id);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      toast({
        title: "Error", 
        description: "Failed to load item details.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorited = async () => {
    if (!item || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', item.id)
        .single();

      setIsFavorited(!!data);
    } catch (error) {
      // No favorite found, which is fine
      setIsFavorited(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }

    if (!item) return;

    setIsTogglingFavorite(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', item.id);

        if (error) throw error;

        setIsFavorited(false);
        toast({
          title: "Removed from Favorites",
          description: "Item removed from your favorites.",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            listing_id: item.id
          });

        if (error) throw error;

        setIsFavorited(true);
        toast({
          title: "Added to Favorites",
          description: "Item saved to your favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const onStartConversation = (item: Listing) => {
    // Navigate to messages page with the item
    navigate(`/messages?item=${item.id}`);
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
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.startsWith('0')) {
      return '233' + digits.substring(1);
    }
    
    if (digits.startsWith('233')) {
      return digits;
    }
    
    if (digits.length === 9) {
      return '233' + digits;
    }
    
    return digits;
  };

  const openWhatsApp = () => {
    const phoneNumber = item?.profiles?.phone_number;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Item not found</p>
          <Button onClick={() => navigate('/')}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const images = getItemImages(item);
  const displayImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      <Helmet>
        <title>{generatePageTitle(item.title)}</title>
        <meta name="description" content={generateMetaDescription(item.description)} />
        <meta property="og:title" content={item.title} />
        <meta property="og:description" content={item.description || "Item available for swap on SwapBoard Ghana"} />
        <meta property="og:image" content={displayImages[0]} />
        <meta property="og:url" content={`https://swapboard.gh/item/${item.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
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
                    <h1 className="text-2xl font-bold text-foreground flex-1">{item.title}</h1>
                    {item.price && (
                      <span className="text-2xl font-bold text-primary ml-4">
                        ₵{item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-primary">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="border-primary/20">
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
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                {/* Location */}
                {item.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{item.location}</span>
                  </div>
                )}

                {/* Wanted Items */}
                {item.wanted_items && item.wanted_items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Looking for</h3>
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
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3">
                      {getUserAvatar(item)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {getUserDisplayName(item)}
                      </p>
                      <p className="text-sm text-muted-foreground">Item Owner</p>
                    </div>
                  </div>
                  
                  {item.user_id && (
                    <UserRatingDisplay userId={item.user_id} size="md" />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
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
                      onClick={toggleFavorite}
                      disabled={isTogglingFavorite}
                      className={`flex-1 ${
                        isFavorited 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70'
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                      {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Button>
                    
                    <Button
                      onClick={() => onStartConversation(item)}
                      variant="outline"
                      className="flex-1 border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                  
                  <div className="flex gap-3">
                    {/* Rate Owner button - only show if user is logged in and not viewing their own item */}
                    {user && user.id !== item.user_id && (
                      <Button
                        onClick={() => setShowRating(true)}
                        variant="outline"
                        className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate Owner
                      </Button>
                    )}
                    
                    <div className="flex-1">
                      <ReportListingDialog 
                        listingId={item.id} 
                        listingTitle={item.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating Dialog */}
      {item.user_id && (
        <UserRating
          open={showRating}
          onOpenChange={setShowRating}
          ratedUserId={item.user_id}
          ratedUserName={getUserDisplayName(item)}
          itemTitle={item.title}
        />
      )}
    </>
  );
};

export default ItemDetail;