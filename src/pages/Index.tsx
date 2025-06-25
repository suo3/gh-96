
import { AppHeader } from "@/components/AppHeader";
import { SwipeMode } from "@/components/SwipeMode";
import { BrowseMode } from "@/components/BrowseMode";
import { FilterPanel } from "@/components/FilterPanel";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { useIndexLogic } from "@/hooks/useIndexLogic";

const Index = () => {
  const {
    displayMode,
    showLoginDialog,
    showFilters,
    showLocationPrompt,
    userLocation,
    filteredListings,
    isMobile,
    setDisplayMode,
    setShowLoginDialog,
    setShowFilters,
    handleLocationSet,
    handleManualLocationEntry,
    handleLocationPromptDismiss,
    handleLocationDetect,
    handleSwipe,
    handleItemLike,
    handlePostItem,
    handleFilterChange
  } = useIndexLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <AppHeader
        userLocation={userLocation}
        displayMode={displayMode}
        showFilters={showFilters}
        onDisplayModeChange={setDisplayMode}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onLocationDetect={handleLocationDetect}
        onPostItem={handlePostItem}
      />

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

        {/* Swipe Mode */}
        {displayMode === "swipe" && isMobile && (
          <SwipeMode items={filteredListings} onSwipe={handleSwipe} />
        )}

        {/* Browse Mode (Grid & List) */}
        {(displayMode === "grid" || displayMode === "list") && (
          <BrowseMode 
            displayMode={displayMode}
            items={filteredListings}
            onItemLike={handleItemLike}
          />
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
