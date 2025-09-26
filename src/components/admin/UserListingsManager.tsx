import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Eye, Heart, CheckCircle, Trash2, Pause, Play, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateListingDialog } from "./CreateListingDialog";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  wanted_items: string[];
  images: string[];
}

interface UserListingsManagerProps {
  userId: string;
  userName: string;
}

export const UserListingsManager = ({ userId, userName }: UserListingsManagerProps) => {
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserListings();
    }
  }, [open, userId]);

  const loadUserListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading user listings:', error);
      toast.error('Failed to load user listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: string, title: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) throw error;

      toast.success(`Listing ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadUserListings();
    } catch (error) {
      console.error('Error toggling listing status:', error);
      toast.error('Failed to update listing status');
    }
  };

  const handleMarkComplete = async (listingId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'completed' })
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Listing marked as completed');
      loadUserListings();
    } catch (error) {
      console.error('Error marking listing as complete:', error);
      toast.error('Failed to mark listing as complete');
    }
  };

  const handleDeleteListing = async (listingId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Listing deleted successfully');
      loadUserListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="w-4 h-4 mr-1" />
          Manage Listings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Listings for {userName}</DialogTitle>
          <DialogDescription>
            View and manage all listings for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              {listings.length} total listings
            </Badge>
            <CreateListingDialog userId={userId} onListingCreated={loadUserListings} />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading listings...</div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No listings found for this user.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{listing.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {listing.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{listing.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            listing.status === 'active' ? 'default' : 
                            listing.status === 'completed' ? 'secondary' : 'outline'
                          }
                        >
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {listing.views || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {listing.likes || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(listing.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {listing.status !== 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(listing.id, listing.status, listing.title)}
                              >
                                {listing.status === 'active' ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkComplete(listing.id, listing.title)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteListing(listing.id, listing.title)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};