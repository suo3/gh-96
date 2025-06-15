
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useListingStore } from '@/stores/listingStore';
import { useToast } from '@/hooks/use-toast';

interface LocationDetectionState {
  isDetecting: boolean;
  hasPermission: boolean | null;
  detectedLocation: string | null;
  error: string | null;
}

export const useLocationDetection = () => {
  const [state, setState] = useState<LocationDetectionState>({
    isDetecting: false,
    hasPermission: null,
    detectedLocation: null,
    error: null
  });
  
  const { user, updateProfile } = useAuthStore();
  const { geocodeLocation, setUserLocation } = useListingStore();
  const { toast } = useToast();

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Using a free geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      // Extract city and state/country for a clean location string
      const city = data.address?.city || data.address?.town || data.address?.village;
      const state = data.address?.state;
      const country = data.address?.country;
      
      if (city && state) {
        return `${city}, ${state}`;
      } else if (city && country) {
        return `${city}, ${country}`;
      } else {
        return data.display_name?.split(',').slice(0, 2).join(',').trim() || null;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser',
        hasPermission: false 
      }));
      return;
    }

    setState(prev => ({ ...prev, isDetecting: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get a readable location
      const locationString = await reverseGeocode(latitude, longitude);
      
      if (locationString) {
        setState(prev => ({ 
          ...prev, 
          hasPermission: true, 
          detectedLocation: locationString,
          isDetecting: false 
        }));

        // Set the location in the listing store for distance calculations
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Update user profile if they're logged in
        if (user) {
          await updateProfile({ location: locationString });
        }

        toast({
          title: "Location Detected",
          description: `Set your location to ${locationString}. You can change this in your profile.`,
        });

        return locationString;
      } else {
        throw new Error('Could not determine location name');
      }
    } catch (error: any) => {
      console.error('Location detection error:', error);
      
      let errorMessage = 'Unable to detect location';
      if (error.code === 1) {
        errorMessage = 'Location access denied';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out';
      }

      setState(prev => ({ 
        ...prev, 
        hasPermission: false, 
        error: errorMessage,
        isDetecting: false 
      }));

      toast({
        title: "Location Detection Failed",
        description: `${errorMessage}. Please set your location manually in your profile.`,
        variant: "destructive"
      });
    }
  };

  const requestLocationPermission = async () => {
    // Check if permission was previously denied
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setState(prev => ({ 
            ...prev, 
            hasPermission: false,
            error: 'Location permission denied. Please enable in browser settings or set location manually.'
          }));
          return;
        }
      } catch (error) {
        console.log('Permission API not supported, proceeding with location request');
      }
    }

    await detectLocation();
  };

  return {
    ...state,
    requestLocationPermission,
    detectLocation
  };
};
