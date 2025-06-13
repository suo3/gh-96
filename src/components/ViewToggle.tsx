
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, LayoutList, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewToggleProps {
  currentView: "swipe" | "grid" | "list";
  onViewChange: (view: "swipe" | "grid" | "list") => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const isMobile = useIsMobile();

  return (
    <ToggleGroup type="single" value={currentView} onValueChange={onViewChange} className="bg-white/80 backdrop-blur-sm rounded-lg p-1">
      {isMobile && (
        <ToggleGroupItem value="swipe" aria-label="Swipe view" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white">
          <Heart className="h-4 w-4" />
        </ToggleGroupItem>
      )}
      <ToggleGroupItem value="grid" aria-label="Grid view" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white">
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-teal-500 data-[state=on]:text-white">
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
