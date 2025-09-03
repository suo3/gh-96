
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ViewToggle } from "@/components/ViewToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/FilterPanel";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useListingStore } from "@/stores/listingStore";

interface ContentControlsProps {
  displayMode: "swipe" | "grid" | "list";
  showFilters: boolean;
  onDisplayModeChange: (mode: "swipe" | "grid" | "list") => void;
  onToggleFilters: () => void;
  onFilterChange: (filters: any) => void;
  hideFilterButton?: boolean;
  showSidebarTrigger?: boolean;
}

export const ContentControls = ({ 
  displayMode, 
  showFilters, 
  onDisplayModeChange, 
  onToggleFilters, 
  onFilterChange,
  hideFilterButton = false,
  showSidebarTrigger = false
}: ContentControlsProps) => {
  const isMobile = useIsMobile();
  const { searchTerm, setSearchTerm } = useListingStore();

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {showSidebarTrigger && !isMobile && (
            <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground transition-colors" />
          )}
          <ViewToggle currentView={displayMode} onViewChange={onDisplayModeChange} />
        </div>
        
        {!hideFilterButton && isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Filter className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel 
                  onFilterChange={onFilterChange}
                  isVisible={true}
                  isMobile={true}
                  showSearch={false}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      {/* Mobile Search Bar - Always Visible */}
      {isMobile && (
        <div className="mb-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border-emerald-200"
          />
        </div>
      )}
    </div>
  );
};
