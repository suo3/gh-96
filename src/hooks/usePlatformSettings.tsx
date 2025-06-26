
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
          settingsMap[item.key] = JSON.parse(item.value as string);
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
        { key: 'maintenance_mode', value: JSON.stringify(newSettings.maintenanceMode) },
        { key: 'max_listings_per_user', value: JSON.stringify(newSettings.maxListingsPerUser) },
        { key: 'require_approval', value: JSON.stringify(newSettings.requireApproval) },
        { key: 'allow_anonymous', value: JSON.stringify(newSettings.allowAnonymous) },
        { key: 'welcome_message', value: JSON.stringify(newSettings.welcomeMessage) },
        { key: 'announcement_text', value: JSON.stringify(newSettings.announcementText) }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert({
            key: update.key,
            value: update.value,
            updated_at: new Date().toISOString()
          });

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
