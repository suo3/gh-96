
import { ItemCard } from "./ItemCard";

interface ItemGridProps {
  items: any[];
  onItemLike: (item: any) => void;
}

export const ItemGrid = ({ items, onItemLike }: ItemGridProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-600">Try adjusting your filters or check back later for new listings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onLike={onItemLike}
        />
      ))}
    </div>
  );
};
