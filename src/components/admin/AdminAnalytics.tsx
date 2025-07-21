
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, Package, MessageSquare, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalSwaps: number;
  totalMessages: number;
  userGrowth: Array<{ month: string; users: number }>;
  listingsByCategory: Array<{ category: string; count: number }>;
  swapActivity: Array<{ month: string; swaps: number }>;
}

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch total counts
      const [usersResult, listingsResult, swapsResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('swaps').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('messages').select('id', { count: 'exact', head: true })
      ]);

      // Fetch listings by category
      const { data: categoryData } = await supabase
        .from('listings')
        .select('category')
        .not('category', 'is', null);

      // Fetch recent user growth (last 6 months)
      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch swap activity (last 6 months)
      const { data: swapActivityData } = await supabase
        .from('swaps')
        .select('created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Process category data
      const categoryMap = new Map();
      categoryData?.forEach(item => {
        categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
      });

      const listingsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      }));

      // Process user growth data
      const userGrowthMap = new Map();
      userGrowthData?.forEach(user => {
        const month = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        userGrowthMap.set(month, (userGrowthMap.get(month) || 0) + 1);
      });

      const userGrowth = Array.from(userGrowthMap.entries()).map(([month, users]) => ({
        month,
        users
      }));

      // Process swap activity data
      const swapActivityMap = new Map();
      swapActivityData?.forEach(swap => {
        const month = new Date(swap.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        swapActivityMap.set(month, (swapActivityMap.get(month) || 0) + 1);
      });

      const swapActivity = Array.from(swapActivityMap.entries()).map(([month, swaps]) => ({
        month,
        swaps
      }));

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalListings: listingsResult.count || 0,
        totalSwaps: swapsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        userGrowth,
        listingsByCategory,
        swapActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSwaps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
            <CardDescription>Distribution of listing categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.listingsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.listingsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Swap Activity</CardTitle>
            <CardDescription>Monthly swap completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.swapActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="swaps" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
