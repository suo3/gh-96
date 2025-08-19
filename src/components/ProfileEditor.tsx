
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { useToast } from "@/components/ui/use-toast";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { PasswordChange } from "./PasswordChange";
import { CoinPurchase } from "./CoinPurchase";
import { LocationInput } from "./LocationInput";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { AccountDeletion } from "./AccountDeletion";
import { Save, Coins, Navigation } from "lucide-react";

export const ProfileEditor = () => {
  const { user, updateProfile } = useAuthStore();
  const { geocodeLocation, setUserLocation } = useListingStore();
  const { toast } = useToast();
  const { isDetecting, requestLocationPermission } = useLocationDetection();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    location: '',
    bio: '',
    profileImageUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    const previousLocation = user?.location;
    await updateProfile(formData);
    
    // If location changed, update the user location coordinates for distance calculations
    if (formData.location !== previousLocation && formData.location) {
      const coordinates = await geocodeLocation(formData.location);
      if (coordinates) {
        setUserLocation(coordinates);
      }
    }
    
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

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Information
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                {user.coins} coins
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex justify-center">
            <ProfileImageUpload
              currentImageUrl={formData.profileImageUrl}
              onImageUploaded={handleImageUploaded}
            />
          </div>

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
            <Label htmlFor="phoneNumber">Phone Number (Ghana)</Label>
            <Input
              id="phoneNumber"
              placeholder="+233 or 0 (e.g., +233241234567 or 0241234567)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Your phone number will be used for WhatsApp contact on your listings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself and what you're looking to swap..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
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

      <CoinPurchase />

      <AccountDeletion />
    </div>
  );
};
