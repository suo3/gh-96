
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ViewToggle } from "@/components/ViewToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/FilterPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentControlsProps {
  displayMode: "swipe" | "grid" | "list";
  showFilters: boolean;
  onDisplayModeChange: (mode: "swipe" | "grid" | "list") => void;
  onToggleFilters: () => void;
  onFilterChange: (filters: any) => void;
}

export const ContentControls = ({
  displayMode,
  showFilters,
  onDisplayModeChange,
  onToggleFilters,
  onFilterChange
}: ContentControlsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <ViewToggle currentView={displayMode} onViewChange={onDisplayModeChange} />
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${showFilters ? 'bg-emerald-100 text-emerald-600' : ''}`}
              >
                <Filter className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-lg font-semibold text-emerald-800">
                  Filter Items
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel 
                  onFilterChange={onFilterChange}
                  isVisible={true}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFilters}
            className={`${showFilters ? 'bg-emerald-100 text-emerald-600' : ''}`}
          >
            <Filter className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
