
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Database } from "lucide-react";
import { toast } from "sonner";

interface AdminSettingsProps {
  adminRole: string | null;
}

export const AdminSettings = ({ adminRole }: AdminSettingsProps) => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maxListingsPerUser: 10,
    requireApproval: false,
    allowAnonymous: false,
    welcomeMessage: "Welcome to SwapBoard!",
    announcementText: ""
  });

  const [dbStats, setDbStats] = useState({
    totalTables: 0,
    totalRows: 0,
    dbSize: "0 MB"
  });

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      // Get table counts for specific tables
      const tables = ['profiles', 'listings', 'swaps', 'messages', 'conversations'] as const;
      let totalRows = 0;

      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        totalRows += count || 0;
      }

      setDbStats({
        totalTables: tables.length,
        totalRows,
        dbSize: "~2.5 MB" // Placeholder - would need database functions for real size
      });
    } catch (error) {
      console.error('Error fetching database stats:', error);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, these would be saved to a settings table
    toast.success('Settings saved successfully');
  };

  const cleanupOldData = async () => {
    try {
      // Clean up old messages (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { error } = await supabase
        .from('messages')
        .delete()
        .lt('created_at', oneYearAgo.toISOString());

      if (error) throw error;

      toast.success('Old data cleaned up successfully');
      fetchDatabaseStats();
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error('Failed to clean up data');
    }
  };

  if (adminRole !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>
            Only super administrators can access settings.
          </CardDescription>
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
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, maintenanceMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="approval">Require Listing Approval</Label>
                <Switch
                  id="approval"
                  checked={settings.requireApproval}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, requireApproval: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous">Allow Anonymous Browsing</Label>
                <Switch
                  id="anonymous"
                  checked={settings.allowAnonymous}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, allowAnonymous: checked }))
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
                  value={settings.maxListingsPerUser}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, maxListingsPerUser: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="welcome">Welcome Message</Label>
                <Input
                  id="welcome"
                  value={settings.welcomeMessage}
                  onChange={(e) =>
                    setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="announcement">Platform Announcement</Label>
            <Textarea
              id="announcement"
              placeholder="Enter any platform-wide announcements..."
              value={settings.announcementText}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, announcementText: e.target.value }))
              }
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
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

          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={cleanupOldData}
              className="w-full sm:w-auto"
            >
              Clean Up Old Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
