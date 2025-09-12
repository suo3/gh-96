
import { AppHeader } from "@/components/AppHeader";
import { HeroSection } from "@/components/HeroSection";
import { CategoryLinks } from "@/components/CategoryLinks";
import { ContentControls } from "@/components/ContentControls";

import { BrowseMode } from "@/components/BrowseMode";
import { FilterPanel } from "@/components/FilterPanel";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { PlatformAnnouncement } from "@/components/PlatformAnnouncement";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { Footer } from "@/components/Footer";
import { FeaturedItemsCarousel } from "@/components/FeaturedItemsCarousel";
import { CategoryTabsCarousel } from "@/components/CategoryTabsCarousel";
import { FeaturedSellersSection } from "@/components/FeaturedSellersSection";
import { FeaturedStoresCarousel } from "@/components/FeaturedStoresCarousel";
import { SellerOnboardingBanner } from "@/components/SellerOnboardingBanner";
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

      {/* Featured Stores Carousel - Above Hero */}
      <FeaturedStoresCarousel />

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

      {/* Seller Onboarding Banner */}
      <SellerOnboardingBanner />

      {/* Hero Section */}
      <HeroSection 
        onPostItem={handlePostItem}
        onBrowseItems={handleBrowseItems}
      />
      
      {/* Featured content sections */}
      <div className="container mx-auto px-4 space-y-12 py-8">
        {/* Featured Items Carousel */}
        <FeaturedItemsCarousel />
        
        {/* Category Tabs with Items */}
        <CategoryTabsCarousel />
        
        {/* Featured Sellers */}
        <FeaturedSellersSection />
      </div>
      
      <CategoryLinks />

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
