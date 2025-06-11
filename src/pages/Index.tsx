import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, Heart, X, RotateCcw, Plus, Search, User } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { PostItemDialog } from "@/components/PostItemDialog";
import { UserProfile } from "@/components/UserProfile";
import { MessagesPanel } from "@/components/MessagesPanel";
import { SearchAndFilter } from "@/components/SearchAndFilter";

const Index = () => {
  const [currentView, setCurrentView] = useState("discover");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [userLocation, setUserLocation] = useState("Seattle, WA");

  // Mock data for demonstration
  const mockItems = [
    {
      id: 1,
      title: "Vintage Coffee Maker",
      description: "Great condition, just upgraded to a newer model",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      user: "Sarah M.",
      location: "0.8 miles away",
      category: "Kitchen",
      condition: "Like New",
      wantedItems: ["Books", "Plants", "Open to offers"]
    },
    {
      id: 2,
      title: "Programming Books Collection",
      description: "React, JavaScript, and Python books - perfect for learning",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      user: "Mike K.",
      location: "1.2 miles away",
      category: "Books",
      condition: "Good",
      wantedItems: ["Electronics", "Kitchen items"]
    },
    {
      id: 3,
      title: "Yoga Mat & Blocks",
      description: "Barely used yoga set, perfect for home workouts",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      user: "Emma L.",
      location: "0.5 miles away",
      category: "Fitness",
      condition: "Like New",
      wantedItems: ["Home decor", "Books"]
    }
  ];

  const [items] = useState(mockItems);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      console.log(`Interested in: ${items[currentItemIndex]?.title}`);
      // Here you would handle the "like" logic
    }
    
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setCurrentItemIndex(0); // Reset to start
    }
  };

  const resetStack = () => {
    setCurrentItemIndex(0);
  };

  const handleSearchResults = (keyword: string) => {
    console.log("Searching for:", keyword);
  };

  const handleFilterChange = (filters: any) => {
    console.log("Filters applied:", filters);
  };

  if (currentView === "search") {
    return (
      <SearchAndFilter
        onSearch={handleSearchResults}
        onFilterChange={handleFilterChange}
        onBack={() => setCurrentView("discover")}
      />
    );
  }

  if (currentView === "discover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SwapBoard</h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userLocation}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView("search")}
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView("messages")}
                  className="relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                    3
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentView("profile")}
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setShowPostDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Discover Amazing Items Nearby
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Swipe right on items you'd love to swap for, left to pass. 
              When both users like each other's items, you'll be matched to chat!
            </p>
          </div>

          {/* Swipe Cards Area */}
          <div className="max-w-md mx-auto">
            <div className="relative h-[600px] flex items-center justify-center">
              {items.length > 0 && currentItemIndex < items.length ? (
                <SwipeCard
                  item={items[currentItemIndex]}
                  onSwipe={handleSwipe}
                  key={`${items[currentItemIndex].id}-${currentItemIndex}`}
                />
              ) : (
                <Card className="w-full h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <CardContent className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RotateCcw className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      That's all for now!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You've seen all available items in your area.
                    </p>
                    <Button onClick={resetStack} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            {items.length > 0 && currentItemIndex < items.length && (
              <div className="flex justify-center space-x-6 mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => handleSwipe('left')}
                >
                  <X className="w-8 h-8 text-red-500" />
                </Button>
                <Button
                  size="lg"
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart className="w-8 h-8 text-white" />
                </Button>
              </div>
            )}

            {/* Swipe Counter */}
            <div className="text-center mt-4">
              <Badge variant="secondary" className="text-sm">
                {Math.max(0, items.length - currentItemIndex)} items remaining today
              </Badge>
            </div>
          </div>
        </main>

        <PostItemDialog 
          open={showPostDialog} 
          onOpenChange={setShowPostDialog} 
        />
      </div>
    );
  }

  if (currentView === "messages") {
    return <MessagesPanel onBack={() => setCurrentView("discover")} />;
  }

  if (currentView === "profile") {
    return <UserProfile onBack={() => setCurrentView("discover")} />;
  }

  return null;
};

export default Index;
