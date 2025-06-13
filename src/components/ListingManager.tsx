
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListingStore } from "@/stores/listingStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Heart, CheckCircle, Trash2, Pause, Play } from "lucide-react";

export const ListingManager = () => {
  const { user } = useAuthStore();
  const { getUserListings, markAsCompleted, deleteListing, updateListing } = useListingStore();
  const { toast } = useToast();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]);

  const loadUserListings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const listings = await getUserListings(user.id);
    setUserListings(listings);
    setIsLoading(false);
  };

  const handleMarkComplete = async (id: string, title: string) => {
    await markAsCompleted(id);
    await loadUserListings();
    toast({
      title: "Listing Completed",
      description: `${title} has been marked as completed.`,
    });
  };

  const handleDelete = async (id: string, title: string) => {
    await deleteListing(id);
    await loadUserListings();
    toast({
      title: "Listing Deleted",
      description: `${title} has been deleted.`,
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateListing(id, { status: newStatus as 'active' | 'paused' });
    await loadUserListings();
    toast({
      title: `Listing ${newStatus === 'active' ? 'Resumed' : 'Paused'}`,
      description: `${title} is now ${newStatus}.`,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Badge variant="outline">
          {userListings.length} total listings
        </Badge>
      </div>

      {userListings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">You haven't created any listings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userListings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        listing.status === 'active' ? 'default' : 
                        listing.status === 'completed' ? 'secondary' : 'outline'
                      }
                    >
                      {listing.status}
                    </Badge>
                    <Badge variant="outline">{listing.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{listing.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {listing.views} views
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {listing.likes} likes
                    </div>
                    <div>
                      Created: {listing.createdAt.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Looking for:</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.wantedItems.map((item: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    {listing.status !== 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(listing.id, listing.status, listing.title)}
                        >
                          {listing.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkComplete(listing.id, listing.title)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(listing.id, listing.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
