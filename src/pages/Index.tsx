import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Heart, X, RotateCcw, Plus, Filter, Navigation } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { ViewToggle } from "@/components/ViewToggle";
import { FilterPanel } from "@/components/FilterPanel";
import { ItemGrid } from "@/components/ItemGrid";
import { ItemList } from "@/components/ItemList";
import { AuthButton } from "@/components/AuthButton";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [displayMode, setDisplayMode] = useState<"swipe" | "grid" | "list">(isMobile ? "swipe" : "grid");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState("Seattle, WA");
  
  const { createConversationFromSwipe, totalUnreadCount, fetchConversations } = useMessageStore();
  const { isAuthenticated, canCreateListing, canMakeSwap, user } = useAuthStore();
  const { 
    filteredListings, 
    markItemAsMessaged, 
    fetchListings,
    setUserLocation: setStoreUserLocation,
    setCurrentUserId,
    geocodeLocation
  } = useListingStore();
  const { requestLocationPermission } = useLocationDetection();
  const { toast } = useToast();

  // Check for login parameter in URL
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setShowLoginDialog(true);
      // Remove the login parameter from URL
      searchParams.delete('login');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, [user?.id, setCurrentUserId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    const initializeLocation = async () => {
      if (user?.location) {
        setUserLocation(user.location);
        const coords = await geocodeLocation(user.location);
        if (coords) {
          setStoreUserLocation(coords);
          fetchListings();
        }
        return;
      }

      const hasSeenLocationPrompt = localStorage.getItem('hasSeenLocationPrompt');
      if (!hasSeenLocationPrompt) {
        setShowLocationPrompt(true);
        localStorage.setItem('hasSeenLocationPrompt', 'true');
      }
    };
    
    initializeLocation();
  }, [user?.location, geocodeLocation, setStoreUserLocation, fetchListings]);

  useEffect(() => {
    if (!isMobile && displayMode === "swipe") {
      setDisplayMode("grid");
    }
    setShowFilters(!isMobile);
  }, [isMobile, displayMode]);

  const handleLocationSet = (location: string) => {
    setUserLocation(location);
    setShowLocationPrompt(false);
  };

  const handleManualLocationEntry = () => {
    setShowLocationPrompt(false);
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleLocationPromptDismiss = () => {
    setShowLocationPrompt(false);
  };

  const handleLocationDetect = async () => {
    const location = await requestLocationPermission();
    if (location) {
      setUserLocation(location);
    }
  };

  // Get filtered items
  const items = filteredListings;
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!canMakeSwap()) {
      toast({
        title: "Swap Limit Reached",
        description: "You've reached your monthly swap limit. Upgrade to Premium for unlimited swaps!",
        variant: "destructive"
      });
      return;
    }

    const currentItem = items[currentItemIndex];
    if (!currentItem) return;

    if (direction === 'right' && currentItem.hasActiveMessage) {
      toast({
        title: "Already Interested",
        description: `You've already shown interest in ${currentItem.title}.`,
        variant: "destructive"
      });
      return;
    }

    if (direction === 'right') {
      try {
        const conversationId = await createConversationFromSwipe(
          currentItem.id, 
          currentItem.title, 
          currentItem.user_id || ''
        );
        markItemAsMessaged(currentItem.id);
        
        toast({
          title: "Match Created!",
          description: `You've shown interest in ${currentItem.title}! A conversation has been started.`,
        });
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setCurrentItemIndex(0);
    }
  };

  const handleItemLike = async (item: any) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!canMakeSwap()) {
      toast({
        title: "Swap Limit Reached",
        description: "You've reached your monthly swap limit. Upgrade to Premium for unlimited swaps!",
        variant: "destructive"
      });
      return;
    }

    if (item.hasActiveMessage) {
      toast({
        title: "Already Interested",
        description: `You've already shown interest in ${item.title}.`,
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
      markItemAsMessaged(item.id);
      
      toast({
        title: "Interest Sent!",
        description: `You've expressed interest in ${item.title}. A conversation has been started.`,
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePostItem = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!canCreateListing()) {
      toast({
        title: "Listing Limit Reached",
        description: "You've reached your monthly listing limit. Upgrade to Premium for unlimited listings!",
        variant: "destructive"
      });
      return;
    }

    navigate("/post");
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters applied:', filters);
  };

  const resetStack = () => {
    setCurrentItemIndex(0);
  };

  const convertToSwipeFormat = (listing: any) => {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description || '',
      image: listing.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      user: listing.profiles?.first_name || listing.profiles?.username || 'User',
      location: listing.location || 'Location not specified',
      category: listing.category,
      condition: listing.condition,
      wantedItems: listing.wanted_items || [],
      distance: listing.distance
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">SwapBoard</h1>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userLocation}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLocationDetect}
                    className="ml-2 h-6 px-2 text-xs hover:bg-emerald-100"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Update
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <ViewToggle currentView={displayMode} onViewChange={setDisplayMode} />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`${showFilters ? 'bg-emerald-100 text-emerald-600' : ''}`}
              >
                <Filter className="w-5 h-5" />
              </Button>
              
              {/* Only show message icon for authenticated users */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/messages")}
                  className="relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  {totalUnreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </Button>
              )}
              
              <AuthButton />
              
              <Button
                onClick={handlePostItem}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Item
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <LocationPermissionPrompt
            onLocationSet={handleLocationSet}
            onManualEntry={handleManualLocationEntry}
            onDismiss={handleLocationPromptDismiss}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <FilterPanel 
          onFilterChange={handleFilterChange}
          isVisible={showFilters && displayMode !== "swipe"}
        />

        {/* Swipe Cards Area */}
        {displayMode === "swipe" && isMobile && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Discover Amazing Items Nearby
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Swipe right on items you'd love to swap for, left to pass. 
                When both users like each other's items, you'll be matched to chat!
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative h-[600px] flex items-center justify-center">
                {items.length > 0 && currentItemIndex < items.length ? (
                  <SwipeCard
                    item={convertToSwipeFormat(items[currentItemIndex])}
                    nextItem={currentItemIndex + 1 < items.length ? convertToSwipeFormat(items[currentItemIndex + 1]) : undefined}
                    onSwipe={handleSwipe}
                    key={`${items[currentItemIndex].id}-${currentItemIndex}`}
                  />
                ) : (
                  <Card className="w-full h-96 flex items-center justify-center border-2 border-dashed border-emerald-300">
                    <CardContent className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RotateCcw className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        That's all for now!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        You've seen all available items in your area.
                      </p>
                      <Button onClick={resetStack} variant="outline" className="border-emerald-200">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Start Over
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              {items.length > 0 && currentItemIndex < items.length && (
                <div className="flex justify-center space-x-6 mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 shadow-lg"
                    onClick={() => handleSwipe('left')}
                  >
                    <X className="w-8 h-8 text-red-500" />
                  </Button>
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                    onClick={() => handleSwipe('right')}
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </Button>
                </div>
              )}

              {/* Swipe Counter */}
              <div className="text-center mt-4">
                <Badge variant="secondary" className="text-sm bg-emerald-100 text-emerald-800">
                  {Math.max(0, items.length - currentItemIndex)} items remaining today
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* Grid View */}
        {displayMode === "grid" && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Browse Items
              </h2>
              <p className="text-gray-600">
                {items.length} item{items.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <ItemGrid items={items} onItemLike={handleItemLike} />
          </>
        )}

        {/* List View */}
        {displayMode === "list" && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Browse Items
              </h2>
              <p className="text-gray-600">
                {items.length} item{items.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <ItemList items={items} onItemLike={handleItemLike} />
          </>
        )}
      </main>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
};

export default Index;
