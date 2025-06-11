
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star } from "lucide-react";

interface ItemListProps {
  items: any[];
  onItemLike: (item: any) => void;
}

export const ItemList = ({ items, onItemLike }: ItemListProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow border-emerald-200">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-emerald-600">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-200">
                      {item.condition}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                        {item.user.charAt(0)}
                      </div>
                      <div className="text-sm text-gray-900">{item.user}</div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    onClick={() => onItemLike(item)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Swap
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
