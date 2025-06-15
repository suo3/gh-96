
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, User } from 'lucide-react';
import { useLocationDetection } from '@/hooks/useLocationDetection';

interface LocationPermissionPromptProps {
  onLocationSet: (location: string) => void;
  onManualEntry: () => void;
  onDismiss: () => void;
}

export const LocationPermissionPrompt = ({ 
  onLocationSet, 
  onManualEntry, 
  onDismiss 
}: LocationPermissionPromptProps) => {
  const { isDetecting, requestLocationPermission } = useLocationDetection();
  const [dismissed, setDismissed] = useState(false);

  const handleAutoDetect = async () => {
    const location = await requestLocationPermission();
    if (location) {
      onLocationSet(location);
    }
  };

  const handleManualEntry = () => {
    onManualEntry();
    setDismissed(true);
  };

  const handleDismiss = () => {
    onDismiss();
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Card className="mx-auto max-w-md border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Find Items Near You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          To show you the best items nearby, we'd like to know your location. 
          You can change this anytime in your profile.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isDetecting ? 'Detecting Location...' : 'Use My Location'}
          </Button>
          
          <Button
            onClick={handleManualEntry}
            variant="outline"
            className="w-full border-emerald-200 hover:bg-emerald-50"
          >
            <User className="w-4 h-4 mr-2" />
            Enter Location Manually
          </Button>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
            size="sm"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
