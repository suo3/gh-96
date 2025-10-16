import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Eye, Check, X, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface PendingListing {
  id: string;
  title: string;
  category: string;
  condition: string;
  location: string;
  user_username: string;
  status: string;
  created_at: string;
  description: string;
  images: string[];
}

export const AdminListingApproval = () => {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const fetchPendingListings = async () => {
    try {
      // Get listings first
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('status', ['pending', 'active', 'rejected'])
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      if (!listingsData || listingsData.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(listingsData.map(l => l.user_id).filter(Boolean))];

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create lookup map
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedListings: PendingListing[] = listingsData.map(listing => {
        const profile = profileMap.get(listing.user_id);
        
        return {
          id: listing.id,
          title: listing.title,
          category: listing.category,
          condition: listing.condition,
          location: listing.location || 'Not specified',
          user_username: profile?.username || 'Unknown User',
          status: listing.status,
          created_at: listing.created_at,
          description: listing.description || '',
          images: listing.images || []
        };
      });

      setListings(formattedListings);
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      toast({
        title: "Error",
        description: "Failed to load pending listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, status: string) => {
    try {
      console.log('Attempting to update listing:', listingId, 'to status:', status);
      
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', listingId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Listing ${status} successfully`,
      });
      fetchPendingListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: `Failed to update listing: ${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to permanently delete this listing?");
      if (!confirmDelete) return;

      const { data, error } = await supabase.functions.invoke('admin-delete-listing', {
        body: { listingId },
      });

      if (error) {
        console.error('Function delete error:', error);
        throw error;
      }

      toast({
        title: "Deleted",
        description: "Listing deleted successfully.",
      });
      fetchPendingListings();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: `Failed to delete listing: ${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  const bulkDeleteListings = async () => {
    if (selectedListings.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select listings to delete",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${selectedListings.length} listing(s)?`);
    if (!confirmDelete) return;

    try {
      let successCount = 0;
      let failCount = 0;

      for (const listingId of selectedListings) {
        try {
          const { error } = await supabase.functions.invoke('admin-delete-listing', {
            body: { listingId },
          });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Error deleting listing:', listingId, err);
          failCount++;
        }
      }

      toast({
        title: successCount > 0 ? "Bulk Delete Complete" : "Error",
        description: `Successfully deleted ${successCount} listing(s)${failCount > 0 ? `, failed to delete ${failCount}` : ''}`,
        variant: failCount > 0 ? "destructive" : "default",
      });

      setSelectedListings([]);
      fetchPendingListings();
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: `Failed to complete bulk delete: ${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  const toggleSelectListing = (listingId: string) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(l => l.id));
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.user_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading pending listings...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Listing Approval
          </CardTitle>
          <CardDescription>
            Review and approve pending listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedListings.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-muted p-4 rounded-lg">
              <span className="text-sm font-medium">
                {selectedListings.length} listing(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteListings}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          <div className="overflow-x-auto -mx-3 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-[150px]">Title</TableHead>
                      <TableHead className="hidden md:table-cell">User</TableHead>
                      <TableHead className="hidden sm:table-cell">Category</TableHead>
                      <TableHead className="hidden lg:table-cell">Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedListings.includes(listing.id)}
                            onCheckedChange={() => toggleSelectListing(listing.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm md:text-base">{listing.title}</div>
                            {listing.description && (
                              <div className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xs truncate">
                                {listing.description}
                              </div>
                            )}
                            <div className="md:hidden text-xs text-muted-foreground mt-1">
                              @{listing.user_username} • {listing.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">@{listing.user_username}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{listing.category}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{listing.condition}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              listing.status === 'pending' ? 'secondary' :
                              listing.status === 'active' ? 'default' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {listing.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                            {listing.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateListingStatus(listing.id, 'active')}
                                  className="text-xs touch-target"
                                >
                                  <Check className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                  <span className="hidden md:inline">Approve</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateListingStatus(listing.id, 'rejected')}
                                  className="text-xs touch-target"
                                >
                                  <X className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                  <span className="hidden md:inline">Reject</span>
                                </Button>
                              </>
                            )}
                            {listing.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateListingStatus(listing.id, 'rejected')}
                                className="text-xs touch-target"
                              >
                                <X className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                <span className="hidden md:inline">Reject</span>
                              </Button>
                            )}
                            {listing.status === 'rejected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateListingStatus(listing.id, 'active')}
                                className="text-xs touch-target"
                              >
                                <Check className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                <span className="hidden md:inline">Reactivate</span>
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteListing(listing.id)}
                              className="text-xs touch-target"
                            >
                              <Trash className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No listings found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};