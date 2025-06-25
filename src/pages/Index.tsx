
import { useState, useEffect } from "react";
import { ItemGrid } from "@/components/ItemGrid";
import { ItemList } from "@/components/ItemList";
import { ViewToggle } from "@/components/ViewToggle";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { PostItemDialog } from "@/components/PostItemDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useListingStore } from "@/stores/listingStore";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/stores/listingStore";

const Index = () => {
  const [viewType, setViewType] = useState<"grid" | "list" | "swipe">("grid");
  const [showPostDialog, setShowPostDialog] = useState(false);
  
  const {
    listings,
    isLoading,
    fetchListings,
    selectedCategory,
    selectedCondition,
    searchTerm,
    sortBy,
    minRating,
    maxDistance,
    swapFilter,
    markItemAsMessaged,
    setSelectedCategory,
    setSelectedCondition,
    setSearchTerm,
    setSortBy,
    setMinRating,
    setMaxDistance,
    setSwapFilter,
    setCurrentUserId,
  } = useListingStore();

  const { createConversationFromSwipe, checkListingHasActiveConversation } = useMessageStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id, setCurrentUserId]);

  // Apply all filters
  const getFilteredItems = () => {
    let filtered = [...listings];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (swapFilter === 'available') {
      filtered = filtered.filter(item => !item.hasActiveMessage);
    } else if (swapFilter === 'active') {
      filtered = filtered.filter(item => item.hasActiveMessage);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  const handleItemLike = async (item: Listing) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start a conversation.",
        variant: "destructive"
      });
      return;
    }

    if (item.userId === user.id) {
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
        item.userId || ''
      );

      if (conversationId) {
        // Mark the item as messaged
        markItemAsMessaged(item.id);
        
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

  const handleSearch = (keyword: string) => {
    setSearchTerm(keyword);
  };

  const handleFilterChange = (filters: {
    category: string;
    condition: string;
    location: string;
    radius: number;
  }) => {
    setSelectedCategory(filters.category || 'all');
    setSelectedCondition(filters.condition || 'all');
    setMaxDistance(filters.radius);
  };

  const handleBack = () => {
    // This could navigate back or close the search/filter view
    console.log('Back button pressed');
  };

  const handleViewChange = (view: "swipe" | "grid" | "list") => {
    setViewType(view);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading items...</div>
      </div>
    );
  }

  // If swipe view is selected, show SearchAndFilter component
  if (viewType === "swipe") {
    return (
      <SearchAndFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Panel */}
        <aside className="lg:w-80">
          {/* We can add FilterPanel here later if needed */}
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Available Items</h1>
              <ViewToggle currentView={viewType} onViewChange={handleViewChange} />
            </div>
            <Button 
              onClick={() => setShowPostDialog(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Item
            </Button>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {listings.length} items
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-4">No items found matching your criteria.</p>
              <p className="text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              {viewType === "grid" ? (
                <ItemGrid items={filteredItems} onItemLike={handleItemLike} />
              ) : (
                <ItemList items={filteredItems} onItemLike={handleItemLike} />
              )}
            </>
          )}
        </main>
      </div>

      <PostItemDialog
        open={showPostDialog}
        onOpenChange={setShowPostDialog}
      />
    </div>
  );
};

export default Index;
