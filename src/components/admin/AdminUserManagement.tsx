
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Shield, Eye } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  location: string;
  coins: number;
  rating: number;
  totalSwaps: number;
  joinedDate: string;
  isAdmin?: boolean;
  adminRole?: string;
}

interface AdminUserManagementProps {
  adminRole: string | null;
}

export const AdminUserManagement = ({ adminRole }: AdminUserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id, role')
        .eq('is_active', true);

      if (adminError) throw adminError;

      // Combine data
      const adminMap = new Map(adminUsers.map(admin => [admin.user_id, admin.role]));

      const formattedUsers: User[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.id, // We'll need to get this from auth
        username: profile.username || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        location: profile.location || '',
        coins: profile.coins || 0,
        rating: parseFloat(profile.rating?.toString() || '0'),
        totalSwaps: profile.total_swaps || 0,
        joinedDate: profile.joined_date || profile.created_at,
        isAdmin: adminMap.has(profile.id),
        adminRole: adminMap.get(profile.id)
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role: role as any,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success('User promoted to admin successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  const removeAdminAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Admin access removed successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error removing admin access:', error);
      toast.error('Failed to remove admin access');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || 
                       (roleFilter === "admin" && user.isAdmin) ||
                       (roleFilter === "user" && !user.isAdmin);

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading users...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage platform users and admin permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins Only</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Swaps</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.location || 'Not set'}</TableCell>
                    <TableCell>{user.coins}</TableCell>
                    <TableCell>{user.rating.toFixed(1)}</TableCell>
                    <TableCell>{user.totalSwaps}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          {user.adminRole}
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {adminRole === 'super_admin' && !user.isAdmin && (
                          <Select onValueChange={(role) => promoteToAdmin(user.id, role)}>
                            <SelectTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="w-4 h-4 mr-1" />
                                Promote
                              </Button>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {adminRole === 'super_admin' && user.isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAdminAccess(user.id)}
                          >
                            Remove Admin
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
