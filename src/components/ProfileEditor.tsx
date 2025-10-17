
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useListingStore } from "@/stores/listingStore";
import { useToast } from "@/components/ui/use-toast";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useGhanaLocation } from "@/hooks/useGhanaLocation";
import { PasswordChange } from "./PasswordChange";

import { LocationInput } from "./LocationInput";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { AccountDeletion } from "./AccountDeletion";
import { Save, Coins, Navigation, Globe, MessageSquare } from "lucide-react";

export const ProfileEditor = () => {
  const { user, updateProfile } = useAuthStore();
  const { geocodeLocation, setUserLocation } = useListingStore();
  const { toast } = useToast();
  const { isDetecting, requestLocationPermission } = useLocationDetection();
  
  const { regions, getCitiesForRegion } = useGhanaLocation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    location: '',
    bio: '',
    profileImageUrl: '',
    preferredLanguage: 'en',
    region: '',
    city: '',
    businessType: '',
    preferredContactMethod: 'whatsapp'
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
        profileImageUrl: user.profileImageUrl || '',
        preferredLanguage: user.preferredLanguage || 'en',
        region: user.region || '',
        city: user.city || '',
        businessType: user.businessType || '',
        preferredContactMethod: user.preferredContactMethod || 'whatsapp'
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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-lg sm:text-xl">Profile Information</span>
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              {/* <Badge variant="outline" className="text-xs sm:text-sm text-yellow-700 border-yellow-300">
                {user.coins} coins
              </Badge> */}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Profile Image Upload */}
          <div className="flex justify-center">
            <ProfileImageUpload
              currentImageUrl={formData.profileImageUrl}
              onImageUploaded={handleImageUploaded}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              placeholder="Tell others about yourself and what you're looking to swap or sell..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Ghana-specific location selection */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      region: value, 
                      city: '', // Reset city when region changes
                      location: value // Update general location field
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
                      location: `${value}, ${prev.region}` // Update general location field
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
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Custom Location (Optional)</Label>
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
                placeholder="Or enter custom location"
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from region/city selection, or enter manually
              </p>
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type (Optional)</Label>
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

          {/* Preferred Contact Method */}
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
                <SelectItem value="whatsapp">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="sms">SMS/Text</SelectItem>
                <SelectItem value="app_message">In-App Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Preference */}
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language</Label>
            <Select
              value={formData.preferredLanguage}
              onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    English
                  </div>
                </SelectItem>
                <SelectItem value="tw">Twi</SelectItem>
                <SelectItem value="ga">Ga</SelectItem>
                <SelectItem value="ewe">Ewe</SelectItem>
                <SelectItem value="dag">Dagbani</SelectItem>
                <SelectItem value="ha">Hausa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full touch-target">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <PasswordChange />

      

      <AccountDeletion />
    </div>
  );
};
