
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
import { AchievementsDisplay } from "./AchievementsDisplay";
import { CoinPurchase } from "./CoinPurchase";
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

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Profile Header - Improved Layout */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-4xl font-bold">
                      {user.avatar}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{userStats.name}</h2>
                    {user.bio && (
                      <p className="text-gray-600 mb-3 max-w-2xl">{user.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {userStats.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joined {userStats.joinDate}
                      </div>
                    </div>
                  </div>

                  {/* Coin Balance - Prominent */}
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg p-4 border border-yellow-300">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-6 h-6 text-yellow-600" />
                      <div className="text-center lg:text-right">
                        <div className="text-2xl font-bold text-yellow-800">{userStats.coins}</div>
                        <div className="text-xs text-yellow-700">coins available</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid - Better Layout */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">{userStats.successfulSwaps}</div>
                    <div className="text-sm text-emerald-700">Successful Swaps</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <UserRatingDisplay userId={user.id} showCount={true} size="lg" />
                    <div className="text-sm text-blue-700 mt-1">Rating</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{userStats.activeListings}</div>
                    <div className="text-sm text-purple-700">Active Listings</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <div className="text-lg font-semibold text-gray-600">
                      {user.monthlyListings || 0} / {user.monthlySwaps || 0}
                    </div>
                    <div className="text-xs text-gray-600">Monthly L/S</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout for Better Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Achievements */}
          <div className="lg:col-span-2">
            <AchievementsDisplay 
              achievements={user.achievements || []}
              totalSwaps={user.totalSwaps}
              rating={user.rating}
            />
          </div>

          {/* Right Column - Recent Ratings */}
          {ratings.length > 0 && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Recent Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ratings.slice(0, 3).map((rating) => (
                      <div key={rating.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{rating.raterUserName}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-600 text-xs mb-1">{rating.comment}</p>
                            )}
                            <div className="text-xs text-gray-400">
                              {rating.itemTitle} • {rating.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {ratings.length > 3 && (
                      <div className="text-center pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAllRatings(true)}
                          className="text-xs"
                        >
                          View All {ratings.length} Ratings
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="coins" className="flex items-center">
              <Coins className="w-4 h-4 mr-2" />
              Buy Coins
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

          <TabsContent value="profile">
            <ProfileEditor />
          </TabsContent>

          <TabsContent value="coins">
            <CoinPurchase />
          </TabsContent>

          <TabsContent value="listings">
            <ListingManager />
          </TabsContent>

          <TabsContent value="history">
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
