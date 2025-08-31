import { AppHeader } from "@/components/AppHeader";
import { ContentControls } from "@/components/ContentControls";
import { SwipeMode } from "@/components/SwipeMode";
import { BrowseMode } from "@/components/BrowseMode";
import { FilterPanel } from "@/components/FilterPanel";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { PlatformAnnouncement } from "@/components/PlatformAnnouncement";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { Footer } from "@/components/Footer";
import { useIndexLogic } from "@/hooks/useIndexLogic";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Helmet } from "react-helmet";

const Marketplace = () => {
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
    handleLogoClick,
    handleFilterChange
  } = useIndexLogic();

  const { settings, loading: settingsLoading } = usePlatformSettings();

  // Show maintenance mode if enabled
  if (!settingsLoading && settings.maintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <>
      <Helmet>
        <title>Marketplace - Browse Items | SwapBoard Ghana</title>
        <meta name="description" content="Browse and discover amazing items in Ghana's premier trading marketplace. Find electronics, fashion, furniture and more." />
        <meta name="keywords" content="marketplace, browse items, Ghana shopping, trade, electronics, fashion, furniture" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader
          userLocation={userLocation}
          onLocationDetect={handleLocationDetect}
          onPostItem={handlePostItem}
          onLogoClick={handleLogoClick}
        />

        {/* Platform Announcement */}
        {!settingsLoading && settings.announcementText && (
          <div className="container mx-auto px-4 pt-4">
            <PlatformAnnouncement message={settings.announcementText} />
          </div>
        )}

        {/* Welcome Message */}
        {!settingsLoading && settings.welcomeMessage && settings.welcomeMessage !== "Welcome to SwapBoard!" && (
          <div className="bg-card/80 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-3">
              <p className="text-center text-primary font-medium">
                {settings.welcomeMessage}
              </p>
            </div>
          </div>
        )}

        {/* Content Controls */}
        {filteredListings.length > 0 && (displayMode !== "swipe" || !isMobile) && (
          <div className="bg-card/50 backdrop-blur-sm border-b border-border">
            <ContentControls
              displayMode={displayMode}
              showFilters={showFilters}
              onDisplayModeChange={setDisplayMode}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

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
          {/* Filters - Only show on desktop when showFilters is true and not in swipe mode */}
          {!isMobile && showFilters && displayMode !== "swipe" && (
            <FilterPanel 
              onFilterChange={handleFilterChange}
              isVisible={true}
            />
          )}

          {/* Show message if no listings */}
          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">
                No items found
              </h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or check back later for new listings.
              </p>
            </div>
          )}

          {/* Swipe Mode */}
          {displayMode === "swipe" && isMobile && filteredListings.length > 0 && (
            <SwipeMode items={filteredListings} onSwipe={handleSwipe} />
          )}

          {/* Browse Mode (Grid & List) */}
          {(displayMode === "grid" || displayMode === "list") && filteredListings.length > 0 && (
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
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Marketplace;