import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Heart, X, RotateCcw, Plus, User, Filter } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { ViewToggle } from "@/components/ViewToggle";
import { FilterPanel } from "@/components/FilterPanel";
import { ItemGrid } from "@/components/ItemGrid";
import { ItemList } from "@/components/ItemList";
import { PostItemDialog } from "@/components/PostItemDialog";
import { UserProfile } from "@/components/UserProfile";
import { MessagesPanel } from "@/components/MessagesPanel";
import { AuthButton } from "@/components/AuthButton";
import { LoginDialog } from "@/components/LoginDialog";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentView, setCurrentView] = useState("discover");
  const isMobile = useIsMobile();
  const [displayMode, setDisplayMode] = useState<"swipe" | "grid" | "list">(isMobile ? "swipe" : "grid");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile); // Show filters by default on desktop
  const [userLocation, setUserLocation] = useState("Seattle, WA");
  const { createConversationFromSwipe } = useMessageStore();
  const { isAuthenticated, canCreateListing, canMakeSwap, user } = useAuthStore();
  const { 
    filteredListings, 
    markItemAsMessaged, 
    fetchListings,
    setUserLocation: setStoreUserLocation,
    setCurrentUserId,
    geocodeLocation
  } = useListingStore();
  const { toast } = useToast();

  // Set current user ID in the listing store when user changes
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, [user?.id, setCurrentUserId]);

  // Load listings on component mount and when user location changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Initialize user location from profile
  useEffect(() => {
    const initializeLocation = async () => {
      if (user?.location) {
        setUserLocation(user.location);
        const coords = await geocodeLocation(user.location);
        if (coords) {
          setStoreUserLocation(coords);
          // Refetch listings to calculate distances
          fetchListings();
        }
      }
    };
    
    if (isAuthenticated && user) {
      initializeLocation();
    }
  }, [user?.location, isAuthenticated, geocodeLocation, setStoreUserLocation, fetchListings]);

  // Update display mode when mobile state changes
  useEffect(() => {
    if (!isMobile && displayMode === "swipe") {
      setDisplayMode("grid");
    }
    // Show filters by default on desktop, hide on mobile
    setShowFilters(!isMobile);
  }, [isMobile, displayMode]);

  // Get filtered items
  const items = filteredListings();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
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

    // Prevent multiple messages for the same item
    if (direction === 'right' && currentItem.hasActiveMessage) {
      toast({
        title: "Already Interested",
        description: `You've already shown interest in ${currentItem.title}.`,
        variant: "destructive"
      });
      return;
    }

    if (direction === 'right') {
      const conversationId = createConversationFromSwipe(currentItem.title, currentItem.profiles?.username ||    'User');
      markItemAsMessaged(currentItem.id);
      
      toast({
        title: "Match Created!",
        description: `You've shown interest in ${currentItem.title}! A conversation has been started.`,
      });
    }
    
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setCurrentItemIndex(0);
    }
  };

  const handleItemLike = (item: any) => {
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

    // Prevent multiple messages for the same item
    if (item.hasActiveMessage) {
      toast({
        title: "Already Interested",
        description: `You've already shown interest in ${item.title}.`,
        variant: "destructive"
      });
      return;
    }

    const conversationId = createConversationFromSwipe(item.title, item.profiles?.username || 'User');
    markItemAsMessaged(item.id);
    
    toast({
      title: "Interest Sent!",
      description: `You've expressed interest in ${item.title}. A conversation has been started.`,
    });
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

    setShowPostDialog(true);
  };

  const handleFilterChange = (filters: any) => {
    // Filters are now handled by the store
    console.log('Filters applied:', filters);
  };

  const resetStack = () => {
    setCurrentItemIndex(0);
  };

  // Convert Listing to SwipeCard compatible format
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

  if (currentView === "messages") {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      setCurrentView("discover");
      return null;
    }
    return <MessagesPanel onBack={() => setCurrentView("discover")} />;
  }

  if (currentView === "profile") {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      setCurrentView("discover");
      return null;
    }
    return <UserProfile onBack={() => setCurrentView("discover")} />;
  }

  if (currentView === "discover") {
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
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => isAuthenticated ? setCurrentView("messages") : setShowLoginDialog(true)}
                  className="relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  {isAuthenticated && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                      3
                    </Badge>
                  )}
                </Button>
                
                <AuthButton
                  onLogin={() => setShowLoginDialog(true)}
                  onProfile={() => setCurrentView("profile")}
                />
                
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Filters */}
          <FilterPanel 
            onFilterChange={handleFilterChange}
            isVisible={showFilters && displayMode !== "swipe"}
          />

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

              {/* Swipe Cards Area */}
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

        <PostItemDialog 
          open={showPostDialog} 
          onOpenChange={setShowPostDialog} 
        />

        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
        />
      </div>
    );
  }

  return null;
};

export default Index;
