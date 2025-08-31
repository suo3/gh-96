import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

interface Location {
  latitude: number;
  longitude: number;
}

export const useIndexLogic = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [displayMode, setDisplayMode] = useState<"swipe" | "grid" | "list">(isMobile ? "swipe" : "grid");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [showHeroSection, setShowHeroSection] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const { createConversationFromSwipe, totalUnreadCount, fetchConversations } = useMessageStore();
  const { isAuthenticated, canCreateListing, canMakeSale, user } = useAuthStore();
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
  const { settings: platformSettings } = usePlatformSettings();

  // Check for login parameter in URL
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setShowLoginDialog(true);
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

  // Enforce anonymous browsing setting
  useEffect(() => {
    if (platformSettings && !platformSettings.allowAnonymous && !isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [platformSettings, isAuthenticated]);

  useEffect(() => {
    const initializeLocation = async () => {
      if (user?.location) {
        const coords = await geocodeLocation(user.location);
        if (coords) {
          // Convert lat/lng to latitude/longitude to match Location interface
          const location: Location = {
            latitude: coords.lat,
            longitude: coords.lng
          };
          setUserLocation(location);
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

  const handleLocationSet = async (location: string) => {
    if (location.trim()) {
      const coords = await geocodeLocation(location);
      if (coords) {
        // Convert lat/lng to latitude/longitude to match Location interface
        const locationObj: Location = {
          latitude: coords.lat,
          longitude: coords.lng
        };
        setUserLocation(locationObj);
        setStoreUserLocation(coords);
        fetchListings();
      }
    }
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
      // Would need to convert string location to coordinates
      console.log('Location detected:', location);
    }
  };

  
  const handleBrowseItems = () => {
    console.log("Browse items clicked - navigating to marketplace");
    navigate("/marketplace");
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!canMakeSale()) {
      toast({
        title: "Swap Limit Reached",
        description: "You've reached your monthly swap limit. Upgrade to Premium for unlimited swaps!",
        variant: "destructive"
      });
      return;
    }

    const currentItem = filteredListings[0]; // SwipeMode will handle index internally
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
  };

  const handleItemLike = async (item: any) => {
    setHasUserInteracted(true);
    setShowHeroSection(false);
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    if (!canMakeSale()) {
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
    setHasUserInteracted(true);
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

  const handleLogoClick = () => {
    setHasUserInteracted(false);
    setShowHeroSection(true);
    navigate('/');
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters applied:', filters);
  };

  return {
    // State
    displayMode,
    showLoginDialog,
    showFilters,
    showLocationPrompt,
    userLocation,
    filteredListings,
    isMobile,
    showHeroSection,
    hasUserInteracted,
    
    // Setters
    setDisplayMode,
    setShowLoginDialog,
    setShowFilters,
    
    // Handlers
    handleLocationSet,
    handleManualLocationEntry,
    handleLocationPromptDismiss,
    handleLocationDetect,
    handleBrowseItems,
    handleSwipe,
    handleItemLike,
    handlePostItem,
    handleLogoClick,
    handleFilterChange
  };
};
