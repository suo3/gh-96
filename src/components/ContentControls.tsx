
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { ViewToggle } from "@/components/ViewToggle";

interface ContentControlsProps {
  displayMode: "swipe" | "grid" | "list";
  showFilters: boolean;
  onDisplayModeChange: (mode: "swipe" | "grid" | "list") => void;
  onToggleFilters: () => void;
}

export const ContentControls = ({
  displayMode,
  showFilters,
  onDisplayModeChange,
  onToggleFilters
}: ContentControlsProps) => {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <ViewToggle currentView={displayMode} onViewChange={onDisplayModeChange} />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFilters}
          className={`${showFilters ? 'bg-emerald-100 text-emerald-600' : ''}`}
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
