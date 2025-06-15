
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, X, Star, MessageCircle } from "lucide-react";
import { useMessageStore } from "@/stores/messageStore";

interface SwipeCardProps {
  item: {
    id: number;
    title: string;
    description: string;
    image: string;
    user: string;
    location: string;
    category: string;
    condition: string;
    wantedItems: string[];
    user_id?: string;
  };
  nextItem?: {
    id: number;
    title: string;
    description: string;
    image: string;
    user: string;
    location: string;
    category: string;
    condition: string;
    wantedItems: string[];
    user_id?: string;
  };
  onSwipe: (direction: 'left' | 'right') => void;
}

export const SwipeCard = ({ item, nextItem, onSwipe }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { itemsWithActiveMessages } = useMessageStore();

  // Check if this item has an active message
  const hasActiveMessage = item.user_id ? itemsWithActiveMessages.has(`${item.title}-${item.user_id}`) : false;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasActiveMessage) return; // Prevent dragging if already swapped
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || hasActiveMessage) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || hasActiveMessage) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (hasActiveMessage) return; // Prevent touch interaction if already swapped
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || hasActiveMessage) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || hasActiveMessage) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = hasActiveMessage ? 0 : dragOffset.x * 0.1;
  const opacity = hasActiveMessage ? 0.8 : Math.max(0.7, 1 - Math.abs(dragOffset.x) / 200);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Next Item Preview */}
      {nextItem && (
        <Card className="absolute inset-0 w-full shadow-md border-emerald-200 transform scale-95 -z-10">
          <div className="relative">
            <img
              src={nextItem.image}
              alt={nextItem.title}
              className="w-full h-64 object-cover rounded-t-lg opacity-80"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-lg" />
          </div>
          <CardContent className="p-4 opacity-80">
            <h4 className="font-semibold text-gray-700 text-sm">{nextItem.title}</h4>
            <p className="text-xs text-gray-600 mt-1">Next up...</p>
          </CardContent>
        </Card>
      )}

      {/* Current Item */}
      <Card
        ref={cardRef}
        className={`w-full transition-all duration-200 border-emerald-200 ${
          hasActiveMessage 
            ? 'cursor-default opacity-80' 
            : 'cursor-grab active:cursor-grabbing hover:shadow-xl'
        } ${
          isDragging ? 'scale-105 shadow-2xl' : 'shadow-lg'
        }`}
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-64 object-cover rounded-t-lg"
            draggable={false}
          />
          
          {/* Already Swapped Indicator */}
          {hasActiveMessage && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
              <div className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center shadow-lg">
                <MessageCircle className="w-6 h-6 mr-2" />
                ALREADY CONTACTED
              </div>
            </div>
          )}
          
          {/* Swipe Indicators - only show if not already swapped */}
          {isDragging && !hasActiveMessage && (
            <>
              <div
                className={`absolute inset-0 bg-emerald-500/20 rounded-t-lg flex items-center justify-center transition-opacity ${
                  dragOffset.x > 50 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center shadow-lg">
                  <Heart className="w-6 h-6 mr-2" />
                  INTERESTED!
                </div>
              </div>
              <div
                className={`absolute inset-0 bg-red-500/20 rounded-t-lg flex items-center justify-center transition-opacity ${
                  dragOffset.x < -50 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg flex items-center shadow-lg">
                  <X className="w-6 h-6 mr-2" />
                  PASS
                </div>
              </div>
            </>
          )}
        </div>

        <CardContent className="p-6 bg-gradient-to-b from-white to-emerald-50/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {item.location}
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 flex-col items-end">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500">{item.category}</Badge>
                {hasActiveMessage && (
                  <Badge className="bg-blue-500 text-white">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Contacted
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">{item.condition}</div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 text-sm leading-relaxed">
            {item.description}
          </p>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Looking for:</div>
            <div className="flex flex-wrap gap-1">
              {item.wantedItems.map((wanted, index) => (
                <Badge key={index} variant="outline" className="text-xs border-emerald-200">
                  {wanted}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                {item.user.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{item.user}</div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">(4.0)</span>
                </div>
              </div>
            </div>
            {hasActiveMessage && (
              <div className="text-xs text-blue-600 font-medium">
                Message sent!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
