
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Shield, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserListingsManager } from "./UserListingsManager";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  location: string;
  coins: number;
  rating: number;
  totalSales: number;
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
        totalSales: profile.total_sales || 0,
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and will delete all their data including listings, messages, and transactions.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
      });

      if (error) throw error;

      toast.success(`User "${userName}" has been permanently deleted.`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message || error}`);
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
            <CreateUserDialog onUserCreated={fetchUsers} />
          </div>

          <div className="overflow-x-auto -mx-3 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">User</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead className="hidden md:table-cell">Coins</TableHead>
                      <TableHead className="hidden sm:table-cell">Rating</TableHead>
                      <TableHead className="hidden md:table-cell">Sales</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right min-w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm md:text-base">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              @{user.username}
                            </div>
                            <div className="md:hidden text-xs text-muted-foreground mt-1">
                              {user.coins} coins • ★{user.rating.toFixed(1)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{user.location || 'Not set'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{user.coins}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{user.rating.toFixed(1)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{user.totalSales}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">{user.adminRole}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 md:gap-2 flex-wrap justify-end">
                            <EditUserDialog user={user} onUserUpdated={fetchUsers} />
                            <UserListingsManager 
                              userId={user.id} 
                              userName={`${user.firstName} ${user.lastName}`.trim() || user.username || 'Unknown User'} 
                            />
                            {adminRole === 'super_admin' && !user.isAdmin && (
                              <div className="flex gap-1 md:gap-2 flex-wrap">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => promoteToAdmin(user.id, 'support')}
                                  className="text-xs touch-target"
                                >
                                  <UserPlus className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                  <span className="hidden lg:inline">Support</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => promoteToAdmin(user.id, 'moderator')}
                                  className="text-xs touch-target"
                                >
                                  <UserPlus className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                  <span className="hidden lg:inline">Moderator</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => promoteToAdmin(user.id, 'super_admin')}
                                  className="text-xs touch-target"
                                >
                                  <UserPlus className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                  <span className="hidden lg:inline">Admin</span>
                                </Button>
                              </div>
                            )}
                            {adminRole === 'super_admin' && user.isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeAdminAccess(user.id)}
                                className="text-xs touch-target"
                              >
                                <span className="hidden md:inline">Remove Admin</span>
                                <span className="md:hidden">Remove</span>
                              </Button>
                            )}
                            {adminRole === 'super_admin' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`.trim() || user.username || 'User')}
                                className="text-xs touch-target"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4 md:mr-1" />
                                <span className="hidden md:inline">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
