
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { PasswordChange } from "./PasswordChange";
import { SubscriptionPayment } from "./SubscriptionPayment";
import { LocationInput } from "./LocationInput";
import { Save, Crown, Navigation } from "lucide-react";

export const ProfileEditor = () => {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const { isDetecting, requestLocationPermission } = useLocationDetection();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateProfile(formData);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleAutoDetectLocation = async () => {
    const location = await requestLocationPermission();
    if (location) {
      setFormData(prev => ({ ...prev, location }));
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Information
            <Badge variant={user.membershipType === 'premium' ? 'default' : 'secondary'}>
              {user.membershipType}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoDetectLocation}
                disabled={isDetecting}
                className="text-xs"
              >
                <Navigation className="w-3 h-3 mr-1" />
                {isDetecting ? 'Detecting...' : 'Auto-detect'}
              </Button>
            </div>
            <LocationInput
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="Enter your city and state"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <PasswordChange />

      <SubscriptionPayment />
    </div>
  );
};
