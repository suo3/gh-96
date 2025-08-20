import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AchievementThresholds {
  firstSwapCount: number;
  swapMasterCount: number;
  highRatingThreshold: number;
  communityFavoriteCount: number;
  speedSwapperCount: number;
  speedSwapperDays: number;
  trustedTraderCount: number;
  loading: boolean;
}

const DEFAULT_THRESHOLDS: AchievementThresholds = {
  firstSwapCount: 1,
  swapMasterCount: 10,
  highRatingThreshold: 4.5,
  communityFavoriteCount: 50,
  speedSwapperCount: 5,
  speedSwapperDays: 7,
  trustedTraderCount: 20,
  loading: false
};

export const useAchievementThresholds = () => {
  const [thresholds, setThresholds] = useState<AchievementThresholds>(DEFAULT_THRESHOLDS);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        setThresholds(prev => ({ ...prev, loading: true }));

        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', [
            'achievement_first_swap_count',
            'achievement_swap_master_count', 
            'achievement_high_rating_threshold',
            'achievement_community_favorite_count',
            'achievement_speed_swapper_count',
            'achievement_speed_swapper_days',
            'achievement_trusted_trader_count'
          ]);

        if (error) throw error;

        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};

        setThresholds({
          firstSwapCount: Number(settingsMap.achievement_first_swap_count) || DEFAULT_THRESHOLDS.firstSwapCount,
          swapMasterCount: Number(settingsMap.achievement_swap_master_count) || DEFAULT_THRESHOLDS.swapMasterCount,
          highRatingThreshold: Number(settingsMap.achievement_high_rating_threshold) || DEFAULT_THRESHOLDS.highRatingThreshold,
          communityFavoriteCount: Number(settingsMap.achievement_community_favorite_count) || DEFAULT_THRESHOLDS.communityFavoriteCount,
          speedSwapperCount: Number(settingsMap.achievement_speed_swapper_count) || DEFAULT_THRESHOLDS.speedSwapperCount,
          speedSwapperDays: Number(settingsMap.achievement_speed_swapper_days) || DEFAULT_THRESHOLDS.speedSwapperDays,
          trustedTraderCount: Number(settingsMap.achievement_trusted_trader_count) || DEFAULT_THRESHOLDS.trustedTraderCount,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching achievement thresholds:', error);
        setThresholds(prev => ({ ...prev, loading: false }));
      }
    };

    fetchThresholds();
  }, []);

  return thresholds;
};