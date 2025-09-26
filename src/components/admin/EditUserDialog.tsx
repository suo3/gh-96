import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGhanaLocation } from "@/hooks/useGhanaLocation";

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
  phoneNumber?: string;
  region?: string;
  city?: string;
  bio?: string;
  businessType?: string;
  preferredContactMethod?: string;
}

interface EditUserDialogProps {
  user: User;
  onUserUpdated: () => void;
}

export const EditUserDialog = ({ user, onUserUpdated }: EditUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { regions, getCitiesForRegion } = useGhanaLocation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    region: '',
    city: '',
    location: '',
    bio: '',
    businessType: '',
    coins: 0,
    preferredContactMethod: 'whatsapp'
  });

  useEffect(() => {
    if (open) {
      // Load full user profile data
      loadUserProfile();
    }
  }, [open, user.id]);

  const loadUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        username: profile.username || '',
        phoneNumber: profile.phone_number || '',
        region: profile.region || '',
        city: profile.city || '',
        location: profile.location || '',
        bio: profile.bio || '',
        businessType: profile.business_type || '',
        coins: profile.coins || 0,
        preferredContactMethod: profile.preferred_contact_method || 'whatsapp'
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          phone_number: formData.phoneNumber,
          region: formData.region,
          city: formData.city,
          location: formData.location || `${formData.city}, ${formData.region}`,
          bio: formData.bio,
          business_type: formData.businessType,
          coins: formData.coins,
          preferred_contact_method: formData.preferredContactMethod
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User profile updated successfully');
      setOpen(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user profile information and settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+233 or 0 (e.g., +233241234567)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    region: value, 
                    city: '',
                    location: value
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    city: value,
                    location: `${value}, ${prev.region}`
                  }));
                }}
                disabled={!formData.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesForRegion(formData.region).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Seller</SelectItem>
                <SelectItem value="small_business">Small Business</SelectItem>
                <SelectItem value="retailer">Retailer</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="sms">SMS/Text</SelectItem>
                <SelectItem value="app_message">In-App Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coins">Coins</Label>
            <Input
              id="coins"
              type="number"
              min="0"
              value={formData.coins}
              onChange={(e) => setFormData(prev => ({ ...prev, coins: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="User bio..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};