
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Heart, RotateCcw } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";

interface SwipeModeProps {
  items: any[];
  onSwipe: (direction: 'left' | 'right') => Promise<void>;
}

export const SwipeMode = ({ items, onSwipe }: SwipeModeProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const convertToSwipeFormat = (listing: any) => {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description || '',
      image: listing.images?.[0] || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      user: listing.profiles?.first_name || listing.profiles?.username || 'User',
      location: listing.location || 'Location not specified',
      category: listing.category,
      condition: listing.condition,
      wantedItems: listing.wanted_items || [],
      distance: listing.distance
    };
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    await onSwipe(direction);
    
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setCurrentItemIndex(0);
    }
  };

  const resetStack = () => {
    setCurrentItemIndex(0);
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Discover Amazing Items Nearby
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Swipe right on items you'd love to swap for, left to pass. 
          When both users like each other's items, you'll be matched to chat!
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative h-[600px] flex items-center justify-center">
          {items.length > 0 && currentItemIndex < items.length ? (
            <SwipeCard
              item={convertToSwipeFormat(items[currentItemIndex])}
              nextItem={currentItemIndex + 1 < items.length ? convertToSwipeFormat(items[currentItemIndex + 1]) : undefined}
              onSwipe={handleSwipe}
              key={`${items[currentItemIndex].id}-${currentItemIndex}`}
            />
          ) : (
            <Card className="w-full h-96 flex items-center justify-center border-2 border-dashed border-emerald-300">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  That's all for now!
                </h3>
                <p className="text-gray-600 mb-4">
                  You've seen all available items in your area.
                </p>
                <Button onClick={resetStack} variant="outline" className="border-emerald-200">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {items.length > 0 && currentItemIndex < items.length && (
          <div className="flex justify-center space-x-6 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 shadow-lg"
              onClick={() => handleSwipe('left')}
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
              onClick={() => handleSwipe('right')}
            >
              <Heart className="w-8 h-8 text-white" />
            </Button>
          </div>
        )}

        <div className="text-center mt-4">
          <Badge variant="secondary" className="text-sm bg-emerald-100 text-emerald-800">
            {Math.max(0, items.length - currentItemIndex)} items remaining today
          </Badge>
        </div>
      </div>
    </>
  );
};
