
import { AppHeader } from "@/components/AppHeader";
import { ContentControls } from "@/components/ContentControls";
import { SwipeMode } from "@/components/SwipeMode";
import { BrowseMode } from "@/components/BrowseMode";
import { FilterPanel } from "@/components/FilterPanel";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { PlatformAnnouncement } from "@/components/PlatformAnnouncement";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { useIndexLogic } from "@/hooks/useIndexLogic";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

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

  const { settings, loading: settingsLoading } = usePlatformSettings();

  // Show maintenance mode if enabled
  if (!settingsLoading && settings.maintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <AppHeader
        userLocation={userLocation}
        onLocationDetect={handleLocationDetect}
        onPostItem={handlePostItem}
      />

      {/* Platform Announcement */}
      {!settingsLoading && settings.announcementText && (
        <div className="container mx-auto px-4 pt-4">
          <PlatformAnnouncement message={settings.announcementText} />
        </div>
      )}

      {/* Welcome Message */}
      {!settingsLoading && settings.welcomeMessage && settings.welcomeMessage !== "Welcome to SwapBoard!" && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-emerald-100">
          <div className="container mx-auto px-4 py-2">
            <p className="text-center text-emerald-700 font-medium">
              {settings.welcomeMessage}
            </p>
          </div>
        </div>
      )}

      {/* Content Controls */}
      {displayMode !== "swipe" || !isMobile ? (
        <div className="bg-white/50 backdrop-blur-sm border-b border-emerald-100">
          <ContentControls
            displayMode={displayMode}
            showFilters={showFilters}
            onDisplayModeChange={setDisplayMode}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onFilterChange={handleFilterChange}
          />
        </div>
      ) : null}

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
        {/* Filters - Only show on desktop and when not in swipe mode */}
        {!isMobile && (
          <FilterPanel 
            onFilterChange={handleFilterChange}
            isVisible={showFilters && displayMode !== "swipe"}
          />
        )}

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
