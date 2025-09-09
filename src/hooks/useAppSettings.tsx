import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  maxDistance: number;
  defaultPriceRange: [number, number];
  maxListingsPerUser: number;
  defaultStartingCoins: number;
  listingCostCoins: number;
  toastRemoveDelay: number;
  loading: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  maxDistance: 25,
  defaultPriceRange: [0, 1000],
  maxListingsPerUser: 10,
  defaultStartingCoins: 20,
  listingCostCoins: 1,
  toastRemoveDelay: 5000,
  loading: false
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettings(prev => ({ ...prev, loading: true }));

        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', [
            'max_distance',
            'default_price_range_min',
            'default_price_range_max',
            'max_listings_per_user',
            'default_starting_coins',
            'listing_cost_coins',
            'toast_remove_delay'
          ]);

        if (error) throw error;

        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};

        setSettings({
          maxDistance: Number(settingsMap.max_distance) || DEFAULT_SETTINGS.maxDistance,
          defaultPriceRange: [
            Number(settingsMap.default_price_range_min) || DEFAULT_SETTINGS.defaultPriceRange[0],
            Number(settingsMap.default_price_range_max) || DEFAULT_SETTINGS.defaultPriceRange[1]
          ],
          maxListingsPerUser: Number(settingsMap.max_listings_per_user) || DEFAULT_SETTINGS.maxListingsPerUser,
          defaultStartingCoins: Number(settingsMap.default_starting_coins) || DEFAULT_SETTINGS.defaultStartingCoins,
          listingCostCoins: Number(settingsMap.listing_cost_coins) || DEFAULT_SETTINGS.listingCostCoins,
          toastRemoveDelay: Number(settingsMap.toast_remove_delay) || DEFAULT_SETTINGS.toastRemoveDelay,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching app settings:', error);
        setSettings(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSettings();
  }, []);

  return settings;
};