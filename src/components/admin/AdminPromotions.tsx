import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Eye, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminPromotions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotedItems, isLoading } = useQuery({
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

  const { data: promotionTransactions } = useQuery({
    queryKey: ['adminPromotionTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_transactions')
        .select(`
          *,
          listing:listings(title),
          profiles(first_name, last_name, username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase
        .from('promoted_items')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Promotion deleted",
        description: "The promotion has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminPromotedItems'] });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Active Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ends At</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotedItems?.map((promotion) => (
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
                  <TableCell>₵{promotion.amount_paid}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePromotion.mutate(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promotion Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotionTransactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                  </TableCell>
                  <TableCell>{transaction.listing?.title}</TableCell>
                  <TableCell>₵{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {transaction.status}
                    </Badge>
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