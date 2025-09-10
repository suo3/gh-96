import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Plus, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminManualFeaturing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('featured');

  // Fetch available listings for featuring
  const { data: availableListings } = useQuery({
    queryKey: ['availableListings', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          category,
          price,
          status,
          created_at,
          user_id,
          profiles(first_name, last_name, username)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch currently promoted items
  const { data: promotedItems } = useQuery({
    queryKey: ['adminPromotedItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promoted_items')
        .select(`
          *,
          listing:listings(id, title, category),
          profiles(first_name, last_name, username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add manual promotion
  const addPromotion = useMutation({
    mutationFn: async ({ listingId, userId, promotionType }: { 
      listingId: string; 
      userId: string; 
      promotionType: string; 
    }) => {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 30); // 30 days promotion

      const { error } = await supabase
        .from('promoted_items')
        .insert({
          listing_id: listingId,
          user_id: userId,
          promotion_type: promotionType,
          starts_at: new Date().toISOString(),
          ends_at: endsAt.toISOString(),
          amount_paid: 0, // Manual featuring is free
          currency: 'GHS',
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Item featured successfully",
        description: "The item has been added to featured listings.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminPromotedItems'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to feature item. It may already be featured.",
        variant: "destructive",
      });
    },
  });

  // Remove promotion
  const removePromotion = useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase
        .from('promoted_items')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Promotion removed",
        description: "The item has been removed from featured listings.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminPromotedItems'] });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Manual Item Featuring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Search Items</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium">Promotion Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="category_featured">Category Featured</SelectItem>
                  <SelectItem value="homepage_carousel">Homepage Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableListings?.map((listing: any) => {
                  const isAlreadyPromoted = promotedItems?.some(
                    (promo: any) => promo.listing_id === listing.id && promo.promotion_type === selectedType
                  );

                  return (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{listing.category}</Badge>
                      </TableCell>
                      <TableCell>₵{listing.price}</TableCell>
                      <TableCell>
                        {listing.profiles?.first_name} {listing.profiles?.last_name}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => {
                            addPromotion.mutate({
                              listingId: listing.id,
                              userId: listing.user_id,
                              promotionType: selectedType
                            });
                          }}
                          disabled={isAlreadyPromoted || addPromotion.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {isAlreadyPromoted ? 'Featured' : 'Feature'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currently Featured Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ends At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotedItems?.map((promotion: any) => (
                <TableRow key={promotion.id}>
                  <TableCell>{promotion.listing?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{promotion.promotion_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {promotion.profiles?.first_name} {promotion.profiles?.last_name}
                  </TableCell>
                  <TableCell>
                    {new Date(promotion.ends_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removePromotion.mutate(promotion.id)}
                      disabled={removePromotion.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};