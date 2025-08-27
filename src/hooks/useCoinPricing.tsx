import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
  id: string;
  plan_id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  savings?: string;
  features: string[];
  is_popular?: boolean;
}

export interface PlatformCosts {
  listingCost: number;
  saleCost: number;
  defaultStartingCoins: number;
}

export const useCoinPricing = () => {
  return useQuery({
    queryKey: ['coinPricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_pricing')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as PricingPlan[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const usePlatformCosts = () => {
  return useQuery({
    queryKey: ['platformCosts'],
    queryFn: async () => {
      const [listingCostResult, saleCostResult, defaultCoinsResult] = await Promise.all([
        supabase.rpc('get_listing_cost'),
        supabase.rpc('get_sale_cost'),
        supabase.rpc('get_default_starting_coins')
      ]);

      if (listingCostResult.error) throw listingCostResult.error;
      if (saleCostResult.error) throw saleCostResult.error;
      if (defaultCoinsResult.error) throw defaultCoinsResult.error;

      return {
        listingCost: listingCostResult.data || 1,
        saleCost: saleCostResult.data || 2,
        defaultStartingCoins: defaultCoinsResult.data || 50,
      } as PlatformCosts;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};