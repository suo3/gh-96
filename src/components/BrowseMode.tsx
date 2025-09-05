
import { ItemGrid } from "@/components/ItemGrid";
import { ItemList } from "@/components/ItemList";

interface BrowseModeProps {
  displayMode: "grid" | "list";
  items: any[];
  onItemLike: (item: any) => Promise<void>;
}

export const BrowseMode = ({ displayMode, items, onItemLike }: BrowseModeProps) => {
  return (
    <>
      {displayMode === "grid" ? (
        <ItemGrid items={items} onItemLike={onItemLike} />
      ) : (
        <ItemList items={items} onItemLike={onItemLike} />
      )}
    </>
  );
};
