
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Users, Flag, BarChart3, Settings, CheckCircle, ArrowLeft, Crown, Star, MessageSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminListingModeration } from "@/components/admin/AdminListingModeration";
import { AdminListingApproval } from "@/components/admin/AdminListingApproval";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminBulkUpload } from "@/components/admin/AdminBulkUpload";
import { AdminBulkImport } from "@/components/admin/AdminBulkImport";
import { AdminPromotions } from "@/components/admin/AdminPromotions";
import { AdminManualFeaturing } from "@/components/admin/AdminManualFeaturing";
import { AdminInquiries } from "@/components/admin/AdminInquiries";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminFeaturedStores } from "@/components/admin/AdminFeaturedStores";
import { AdminDistributors } from "@/components/admin/AdminDistributors";
import { Footer } from "@/components/Footer";
import { AppHeader } from "@/components/AppHeader";

const Admin = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated || !user) {
        navigate("/");
        return;
      }

      try {
        // Check if user is admin
        const { data: adminCheck, error } = await supabase.rpc('is_admin');
        
        if (error || !adminCheck) {
          navigate("/");
          return;
        }

        // Get admin role
        const { data: role, error: roleError } = await supabase.rpc('get_admin_role');
        
        if (!roleError && role) {
          setIsAdmin(true);
          setAdminRole(role);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-28 md:pb-0">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => {}}
          onLogoClick={() => navigate('/')}
        />
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="mb-4 md:mb-6 touch-target"
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">
              Welcome back, {user?.firstName}! You have {adminRole} access.
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-4 md:space-y-6">
            <ScrollArea className="w-full pb-2">
              <TabsList className="inline-flex w-max min-w-full md:w-auto md:grid md:grid-cols-11">
                <TabsTrigger value="analytics" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="approval" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Listings</span>
                </TabsTrigger>
                <TabsTrigger value="distributors" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Shield className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Distributors</span>
                </TabsTrigger>
                <TabsTrigger value="bulk-import" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Shield className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Bulk Import</span>
                </TabsTrigger>
                <TabsTrigger value="promotions" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Star className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Promotions</span>
                </TabsTrigger>
                <TabsTrigger value="featured-stores" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Crown className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Featured</span>
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Inquiries</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="moderation" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Flag className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
                  <Settings className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserManagement adminRole={adminRole} />
            </TabsContent>
            
            <TabsContent value="approval">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Listing Management</h2>
                  <AdminBulkUpload />
                </div>
                <AdminListingApproval />
              </div>
            </TabsContent>

            <TabsContent value="distributors">
              <AdminDistributors />
            </TabsContent>

            <TabsContent value="bulk-import">
              <AdminBulkImport />
            </TabsContent>

            <TabsContent value="promotions">
              <div className="space-y-6">
                <AdminPromotions />
                <AdminManualFeaturing />
              </div>
            </TabsContent>

            <TabsContent value="featured-stores">
              <AdminFeaturedStores adminRole={adminRole} />
            </TabsContent>

            <TabsContent value="inquiries">
              <AdminInquiries />
            </TabsContent>

            <TabsContent value="messages">
              <AdminMessages />
            </TabsContent>
            
            <TabsContent value="moderation">
              <AdminListingModeration />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings adminRole={adminRole} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Admin;
