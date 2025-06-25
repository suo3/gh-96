
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Award, MapPin, Calendar, Star, User, List, Coins } from "lucide-react";
import { ProfileEditor } from "./ProfileEditor";
import { ListingManager } from "./ListingManager";
import { HistoryTab } from "./HistoryTab";
import { UserRatingDisplay } from "./UserRatingDisplay";
import { AllRatingsModal } from "./AllRatingsModal";
import { useAuthStore } from "@/stores/authStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useEffect } from "react";

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile = ({ onBack }: UserProfileProps) => {
  const { user } = useAuthStore();
  const { userRatings, fetchUserRatings } = useRatingStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [showAllRatings, setShowAllRatings] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserRatings(user.id);
    }
  }, [user?.id, fetchUserRatings]);

  if (!user) return null;

  // Ensure joinedDate is a Date object
  const joinedDate = user.joinedDate instanceof Date ? user.joinedDate : new Date(user.joinedDate);

  const userStats = {
    name: `${user.firstName} ${user.lastName}`,
    joinDate: joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    location: user.location,
    successfulSwaps: user.totalSwaps,
    rating: user.rating,
    activeListings: 3,
    totalViews: 156,
    coins: user.coins
  };

  // Get user's ratings
  const ratings = userRatings[user.id] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-900">{userStats.name}</h2>
                  <div className="flex items-center space-x-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {userStats.coins} coins
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userStats.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {userStats.joinDate}
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{userStats.successfulSwaps}</div>
                    <div className="text-sm text-gray-600">Successful Swaps</div>
                  </div>
                  <div className="text-center">
                    <UserRatingDisplay userId={user.id} showCount={true} size="lg" />
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userStats.activeListings}</div>
                    <div className="text-sm text-gray-600">Active Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      Monthly Usage
                    </div>
                    <div className="text-xs text-gray-500">
                      Listings: {user.monthlyListings || 0} | Swaps: {user.monthlySwaps || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coin Balance Card */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Coins className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Coin Balance</h3>
                  <p className="text-yellow-700">You have {userStats.coins} coins remaining</p>
                </div>
              </div>
              <div className="text-right text-sm text-yellow-600">
                <p>• 1 coin = 1 listing post</p>
                <p>• 2 coins = 1 swap opportunity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Summary */}
        {ratings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ratings.slice(0, 3).map((rating) => (
                  <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{rating.raterUserName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-gray-600 text-sm">{rating.comment}</p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {rating.itemTitle} • {rating.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {ratings.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllRatings(true)}
                    >
                      View All {ratings.length} Ratings
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center">
              <List className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Award className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileEditor />
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <ListingManager />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </main>

      <AllRatingsModal
        userId={user.id}
        open={showAllRatings}
        onOpenChange={setShowAllRatings}
      />
    </div>
  );
};
