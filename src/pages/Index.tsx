
import { AppHeader } from "@/components/AppHeader";
import { HeroSection } from "@/components/HeroSection";
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

const Index = () => {
  const {
    displayMode,
    showLoginDialog,
    showFilters,
    showLocationPrompt,
    userLocation,
    filteredListings,
    isMobile,
    showHeroSection,
    hasUserInteracted,
    setDisplayMode,
    setShowLoginDialog,
    setShowFilters,
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
  } = useIndexLogic();

  const { settings, loading: settingsLoading } = usePlatformSettings();

  // Show maintenance mode if enabled
  if (!settingsLoading && settings.maintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
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

      {/* Show Hero Section when appropriate */}
      {showHeroSection && (!hasUserInteracted || filteredListings.length === 0) && (
        <HeroSection 
          onPostItem={handlePostItem}
          onBrowseItems={handleBrowseItems}
        />
      )}

      {/* Content Controls - Only show when there are listings and hero is not shown */}
      {!showHeroSection && filteredListings.length > 0 && (displayMode !== "swipe" || !isMobile) && (
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

      {/* Main Content - Only show when there are listings and hero is not shown */}
      {!showHeroSection && filteredListings.length > 0 && (
        <main className="container mx-auto px-4 py-8">
          {/* Filters - Only show on desktop when showFilters is true and not in swipe mode */}
          {!isMobile && showFilters && displayMode !== "swipe" && (
            <FilterPanel 
              onFilterChange={handleFilterChange}
              isVisible={true}
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
      )}

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
