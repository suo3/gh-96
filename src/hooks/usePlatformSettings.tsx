
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSettings {
  maintenanceMode: boolean;
  maxListingsPerUser: number;
  requireApproval: boolean;
  allowAnonymous: boolean;
  welcomeMessage: string;
  announcementText: string;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    maxListingsPerUser: 10,
    requireApproval: false,
    allowAnonymous: false,
    welcomeMessage: "Welcome to SwapBoard!",
    announcementText: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('Fetching platform settings...');

      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value');

      if (error) {
        console.error('Error fetching settings:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
          // The value is already parsed as JSONB, no need to JSON.parse again
          settingsMap[item.key] = item.value;
        });

        setSettings({
          maintenanceMode: settingsMap.maintenance_mode === true,
          maxListingsPerUser: Number(settingsMap.max_listings_per_user) || 10,
          requireApproval: settingsMap.require_approval === true,
          allowAnonymous: settingsMap.allow_anonymous === true,
          welcomeMessage: settingsMap.welcome_message || "Welcome to SwapBoard!",
          announcementText: settingsMap.announcement_text || ""
        });

        console.log('Platform settings loaded:', settingsMap);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    try {
      console.log('Updating platform settings:', newSettings);

      const updates = [
        { key: 'maintenance_mode', value: newSettings.maintenanceMode },
        { key: 'max_listings_per_user', value: newSettings.maxListingsPerUser },
        { key: 'require_approval', value: newSettings.requireApproval },
        { key: 'allow_anonymous', value: newSettings.allowAnonymous },
        { key: 'welcome_message', value: newSettings.welcomeMessage },
        { key: 'announcement_text', value: newSettings.announcementText }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .update({
            value: update.value,
            updated_at: new Date().toISOString()
          })
          .eq('key', update.key);

        if (error) {
          console.error(`Error updating ${update.key}:`, error);
          throw error;
        }
      }

      setSettings(newSettings);
      console.log('Platform settings updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update platform settings');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};
