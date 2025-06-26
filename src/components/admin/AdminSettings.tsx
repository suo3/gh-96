import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Database } from "lucide-react";
import { toast } from "sonner";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { supabase } from "@/integrations/supabase/client";

interface AdminSettingsProps {
  adminRole: string | null;
}

export const AdminSettings = ({ adminRole }: AdminSettingsProps) => {
  const { settings, loading: settingsLoading, updateSettings } = usePlatformSettings();

  const [dbStats, setDbStats] = useState({
    totalTables: 0,
    totalRows: 0,
    dbSize: "0 MB"
  });

  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when platform settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching database statistics...');
      
      // Get table counts for specific tables
      const tables = ['profiles', 'listings', 'swaps', 'messages', 'conversations'] as const;
      let totalRows = 0;

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.warn(`Error counting ${table}:`, error);
            continue;
          }
          
          totalRows += count || 0;
        } catch (err) {
          console.warn(`Failed to count ${table}:`, err);
        }
      }

      setDbStats({
        totalTables: tables.length,
        totalRows,
        dbSize: "~2.5 MB" // Placeholder - would need database functions for real size
      });

      console.log('Database stats updated:', { totalRows, totalTables: tables.length });
    } catch (error) {
      console.error('Error fetching database stats:', error);
      toast.error('Failed to load database statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    const success = await updateSettings(localSettings);
    if (success) {
      toast.success('Settings saved successfully');
    } else {
      toast.error('Failed to save settings');
    }
  };

  const cleanupOldData = async () => {
    try {
      setLoading(true);
      console.log('Starting data cleanup...');
      
      // Clean up old messages (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { error } = await supabase
        .from('messages')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());

      if (error) throw error;

      toast.success('Old data cleaned up successfully');
      console.log('Data cleanup completed');
      await fetchDatabaseStats(); // Refresh stats after cleanup
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error('Failed to clean up data');
    } finally {
      setLoading(false);
    }
  };

  if (adminRole !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Only super administrators can access settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Your current role: {adminRole || 'Unknown'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Contact a super administrator to access these settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading settings...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Settings
          </CardTitle>
          <CardDescription>
            Configure platform-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance">Maintenance Mode</Label>
                <Switch
                  id="maintenance"
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="approval">Require Listing Approval</Label>
                <Switch
                  id="approval"
                  checked={localSettings.requireApproval}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, requireApproval: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous">Allow Anonymous Browsing</Label>
                <Switch
                  id="anonymous"
                  checked={localSettings.allowAnonymous}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, allowAnonymous: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="maxListings">Max Listings per User</Label>
                <Input
                  id="maxListings"
                  type="number"
                  min="1"
                  max="100"
                  value={localSettings.maxListingsPerUser}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, maxListingsPerUser: parseInt(e.target.value) || 10 })
                  }
                />
              </div>

              <div>
                <Label htmlFor="welcome">Welcome Message</Label>
                <Input
                  id="welcome"
                  value={localSettings.welcomeMessage}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, welcomeMessage: e.target.value })
                  }
                  placeholder="Enter welcome message..."
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="announcement">Platform Announcement</Label>
            <Textarea
              id="announcement"
              placeholder="Enter any platform-wide announcements..."
              value={localSettings.announcementText}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, announcementText: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleSaveSettings} 
            className="w-full sm:w-auto"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Monitor and manage database health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{dbStats.totalTables}</div>
              <div className="text-sm text-gray-600">Tables</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dbStats.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{dbStats.dbSize}</div>
              <div className="text-sm text-gray-600">Database Size</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={cleanupOldData}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Cleaning..." : "Clean Up Old Data"}
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchDatabaseStats}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Refreshing..." : "Refresh Stats"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
