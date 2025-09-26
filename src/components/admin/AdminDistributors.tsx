import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Eye, Edit, Trash2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { AdminDistributorsBulkImport } from './AdminDistributorsBulkImport';

interface DistributorProfile {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  region?: string;
  city?: string;
  category: string;
  description?: string;
  business_type?: string;
  website?: string;
  contact_person?: string;
  contact_person_role?: string;
  verification_status: string;
  is_active: boolean;
  source: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const AdminDistributors: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<DistributorProfile | null>(null);

  // Form state for new/edit distributor
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    address: '',
    region: '',
    city: '',
    category: '',
    description: '',
    business_type: '',
    website: '',
    contact_person: '',
    contact_person_role: '',
    verification_status: 'pending',
    is_active: true,
    notes: ''
  });

  // Fetch distributors
  const { data: distributors, isLoading } = useQuery({
    queryKey: ['distributors', searchTerm, categoryFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('distributor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DistributorProfile[];
    }
  });

  // Get unique categories for filter
  const categories = [...new Set(distributors?.map(d => d.category) || [])];

  // Add distributor mutation
  const addDistributorMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('distributor_profiles')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast({
        title: "Success",
        description: "Distributor added successfully",
      });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add distributor",
        variant: "destructive",
      });
      console.error('Error adding distributor:', error);
    }
  });

  // Update distributor mutation
  const updateDistributorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('distributor_profiles')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast({
        title: "Success",
        description: "Distributor updated successfully",
      });
      setEditingDistributor(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update distributor",
        variant: "destructive",
      });
      console.error('Error updating distributor:', error);
    }
  });

  // Delete distributor mutation
  const deleteDistributorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('distributor_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
      toast({
        title: "Success",
        description: "Distributor deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete distributor",
        variant: "destructive",
      });
      console.error('Error deleting distributor:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone_number: '',
      email: '',
      address: '',
      region: '',
      city: '',
      category: '',
      description: '',
      business_type: '',
      website: '',
      contact_person: '',
      contact_person_role: '',
      verification_status: 'pending',
      is_active: true,
      notes: ''
    });
  };

  const handleEdit = (distributor: DistributorProfile) => {
    setEditingDistributor(distributor);
    setFormData({
      name: distributor.name,
      phone_number: distributor.phone_number || '',
      email: distributor.email || '',
      address: distributor.address || '',
      region: distributor.region || '',
      city: distributor.city || '',
      category: distributor.category,
      description: distributor.description || '',
      business_type: distributor.business_type || '',
      website: distributor.website || '',
      contact_person: distributor.contact_person || '',
      contact_person_role: distributor.contact_person_role || '',
      verification_status: distributor.verification_status,
      is_active: distributor.is_active,
      notes: distributor.notes || ''
    });
  };

  const handleSubmit = () => {
    if (editingDistributor) {
      updateDistributorMutation.mutate({ id: editingDistributor.id, data: formData });
    } else {
      addDistributorMutation.mutate(formData);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Distributors Management</h2>
        <div className="flex space-x-2">
          <AdminDistributorsBulkImport />
          <Dialog open={showAddDialog || !!editingDistributor} onOpenChange={(open) => {
            if (!open) {
              setShowAddDialog(false);
              setEditingDistributor(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Distributor
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., FMCG, Pharmaceutical, Electronics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Greater Accra, Ashanti, etc."
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Accra, Kumasi, etc."
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
              <div>
                <Label htmlFor="business_type">Business Type</Label>
                <Input
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  placeholder="Wholesale, Import/Export, etc."
                />
              </div>
              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="contact_person_role">Contact Person Role</Label>
                <Input
                  id="contact_person_role"
                  value={formData.contact_person_role}
                  onChange={(e) => setFormData({ ...formData, contact_person_role: e.target.value })}
                  placeholder="Manager, Director, etc."
                />
              </div>
              <div>
                <Label htmlFor="verification_status">Verification Status</Label>
                <Select
                  value={formData.verification_status}
                  onValueChange={(value) => setFormData({ ...formData, verification_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Company description and services"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this distributor"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingDistributor(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.category}
              >
                {editingDistributor ? 'Update' : 'Add'} Distributor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Distributors</p>
                <p className="text-2xl font-bold">{distributors?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">
                  {distributors?.filter(d => d.verification_status === 'verified').length || 0}
                </p>
              </div>
              <Badge className="h-8 w-8 rounded-full bg-green-100 text-green-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {distributors?.filter(d => d.verification_status === 'pending').length || 0}
                </p>
              </div>
              <Badge className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-700" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {distributors?.filter(d => d.is_active).length || 0}
                </p>
              </div>
              <Badge className="h-8 w-8 rounded-full bg-blue-100 text-blue-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search distributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Distributors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributors ({distributors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading distributors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributors?.map((distributor) => (
                  <TableRow key={distributor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{distributor.name}</div>
                        {distributor.contact_person && (
                          <div className="text-sm text-muted-foreground">
                            {distributor.contact_person}
                            {distributor.contact_person_role && ` (${distributor.contact_person_role})`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{distributor.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {distributor.phone_number && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {distributor.phone_number}
                          </div>
                        )}
                        {distributor.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {distributor.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {distributor.city && distributor.region ? (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {distributor.city}, {distributor.region}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={distributor.is_active ? 'default' : 'secondary'}>
                        {distributor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(distributor.verification_status)}>
                        {distributor.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(distributor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDistributorMutation.mutate(distributor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};