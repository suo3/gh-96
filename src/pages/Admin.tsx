
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Flag, BarChart3, Settings, CheckCircle, ArrowLeft, Crown, Star, MessageSquare } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post')}
          onLogoClick={() => navigate('/')}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName}! You have {adminRole} access.
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-11 lg:w-auto lg:grid-cols-11">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Listings
              </TabsTrigger>
              <TabsTrigger value="distributors" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Distributors
              </TabsTrigger>
              <TabsTrigger value="bulk-import" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Bulk Import
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Promotions
              </TabsTrigger>
              <TabsTrigger value="featured-stores" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Inquiries
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

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
