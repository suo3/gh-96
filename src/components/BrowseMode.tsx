
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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Browse Items
        </h2>
        <p className="text-gray-600">
          {items.length} item{items.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {displayMode === "grid" ? (
        <ItemGrid items={items} onItemLike={onItemLike} />
      ) : (
        <ItemList items={items} onItemLike={onItemLike} />
      )}
    </>
  );
};
