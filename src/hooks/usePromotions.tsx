import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromotedItem {
  id: string;
  listing_id: string;
  user_id: string;
  promotion_type: string;
  starts_at: string;
  ends_at: string;
  amount_paid: number;
  currency: string;
  status: string;
  listing?: any;
}

export interface PromotionTransaction {
  id: string;
  user_id: string;
  listing_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  provider: string;
  promotion_type: string;
  promotion_duration_days: number;
  status: string;
  created_at: string;
}

export const usePromotedItems = (promotionType?: string, category?: string) => {
  return useQuery({
    queryKey: ['promotedItems', promotionType, category],
    queryFn: async () => {
      let query = supabase
        .from('promoted_items')
        .select(`
          *,
          listing:listings(
            *,
            profiles(
              id,
              first_name,
              last_name,
              username,
              avatar,
              rating,
              total_sales
            )
          )
        `)
        .eq('status', 'active')
        .gte('ends_at', new Date().toISOString());

      if (promotionType) {
        query = query.eq('promotion_type', promotionType);
      }

      if (category) {
        query = query.eq('listing.category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as PromotedItem[];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

export const useFeaturedSellers = () => {
  return useQuery({
    queryKey: ['featuredSellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_sellers')
        .select(`
          *,
          profiles(
            id,
            first_name,
            last_name,
            username,
            avatar,
            rating,
            total_sales,
            bio
          )
        `)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const usePromotionPrices = () => {
  return useQuery({
    queryKey: ['promotionPrices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', [
          'promotion_featured_price',
          'promotion_category_price',
          'promotion_carousel_price',
          'promotion_default_duration'
        ]);

      if (error) throw error;
      
      const prices: Record<string, number> = {};
      data.forEach(item => {
        prices[item.key] = parseFloat(item.value as string);
      });
      
      return prices;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const usePromoteItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      promotionType,
      phoneNumber,
      provider,
      durationDays = 7
    }: {
      listingId: string;
      promotionType: string;
      phoneNumber: string;
      provider: string;
      durationDays?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('promote-item', {
        body: {
          listingId,
          promotionType,
          phoneNumber,
          provider,
          durationDays
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Promotion initiated!",
        description: "Your mobile money payment is being processed. Your item will be promoted once payment is confirmed.",
      });
      queryClient.invalidateQueries({ queryKey: ['promotedItems'] });
      queryClient.invalidateQueries({ queryKey: ['promotionTransactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Promotion failed",
        description: error.message || "Failed to initiate promotion. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUserPromotionTransactions = () => {
  return useQuery({
    queryKey: ['userPromotionTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotion_transactions')
        .select(`
          *,
          listing:listings(title, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromotionTransaction[];
    },
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });
};