
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star, MessageCircle, Eye } from "lucide-react";
import { ItemDetailModal } from "./ItemDetailModal";
import { Listing } from "@/stores/listingStore";

interface ItemListProps {
  items: Listing[];
  onItemLike: (item: Listing) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  const [selectedItem, setSelectedItem] = useState<Listing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDetailsClick = (item: Listing) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className={`hover:shadow-lg transition-shadow border-emerald-200 ${
              item.hasActiveMessage ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location || "Location not specified"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-600">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200">
                        {item.condition}
                      </Badge>
                      {item.hasActiveMessage && (
                        <Badge className="bg-blue-600 text-white">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                          {item.profiles?.first_name?.charAt(0) || item.profiles?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="text-sm text-gray-900">
                          {item.profiles?.first_name || item.profiles?.username || 'User'}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.views || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDetailsClick(item)}
                        className="border-emerald-200"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className={`${
                          item.hasActiveMessage 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                        }`}
                        onClick={() => !item.hasActiveMessage && onItemLike(item)}
                        disabled={item.hasActiveMessage}
                      >
                        {item.hasActiveMessage ? (
                          <>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-1" />
                            Swap
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ItemDetailModal
        item={selectedItem}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onItemLike={onItemLike}
      />
    </>
  );
};
