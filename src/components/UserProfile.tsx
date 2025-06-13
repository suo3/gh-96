import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Award, MapPin, Calendar, Star, RotateCcw, User, MessageSquare, List, Crown } from "lucide-react";
import { ProfileEditor } from "./ProfileEditor";
import { ListingManager } from "./ListingManager";
import { ConversationManager } from "./ConversationManager";
import { useAuthStore } from "@/stores/authStore";

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile = ({ onBack }: UserProfileProps) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");

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
    totalViews: 156
  };

  const recentSwaps = [
    { item: "Vintage Camera", swappedFor: "Programming Books", date: "2 days ago", partner: "Sarah M." },
    { item: "Coffee Maker", swappedFor: "Yoga Mat", date: "1 week ago", partner: "Mike K." },
    { item: "Board Games", swappedFor: "Kitchen Scale", date: "2 weeks ago", partner: "Emma L." }
  ];

  const currentListings = [
    { title: "Guitar Amplifier", views: 24, likes: 8, category: "Music" },
    { title: "Cooking Books Set", views: 18, likes: 12, category: "Books" },
    { title: "Plant Collection", views: 31, likes: 15, category: "Garden" }
  ];

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
                  {user.membershipType === 'premium' && (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  )}
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
                  <Badge variant={user.membershipType === 'premium' ? 'default' : 'secondary'}>
                    {user.membershipType}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{userStats.successfulSwaps}</div>
                    <div className="text-sm text-gray-600">Successful Swaps</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-2xl font-bold text-yellow-500">
                      {userStats.rating}
                      <Star className="w-5 h-5 ml-1 fill-current" />
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userStats.activeListings}</div>
                    <div className="text-sm text-gray-600">Active Listings</div>
                  </div>
                  {user.membershipType === 'free' && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        Listings: {user.monthlyListings}/10
                      </div>
                      <div className="text-sm text-gray-600">
                        Swaps: {user.monthlySwaps}/20
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center">
              <List className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversations
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

          <TabsContent value="conversations" className="mt-6">
            <ConversationManager />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Swaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-emerald-600" />
                    Recent Swaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSwaps.map((swap, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{swap.item}</div>
                          <Badge variant="secondary">{swap.date}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Swapped for: <span className="font-medium ml-1">{swap.swappedFor}</span>
                          </div>
                          <div className="mt-1">With {swap.partner}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-semibold text-emerald-700">First Swap</div>
                      <div className="text-sm text-emerald-600">Welcome to the community!</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RotateCcw className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-semibold text-blue-700">10 Swaps</div>
                      <div className="text-sm text-blue-600">Active swapper</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-semibold text-yellow-700">5 Star Rating</div>
                      <div className="text-sm text-yellow-600">Excellent reputation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
