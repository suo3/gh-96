
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Star } from "lucide-react";

interface ItemGridProps {
  items: any[];
  onItemLike: (item: any) => void;
}

export const ItemGrid = ({ items, onItemLike }: ItemGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-emerald-200">
          <div className="relative overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <Badge className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-sm">
              {item.category}
            </Badge>
            <Button
              className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="ghost"
              onClick={() => onItemLike(item)}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
              <Badge variant="outline" className="text-xs border-emerald-200">
                {item.condition}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location}
            </div>
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm text-gray-600 ml-1">(4.0)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                  {item.user.charAt(0)}
                </div>
                <div className="text-sm text-gray-900">{item.user}</div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
