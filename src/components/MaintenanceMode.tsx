
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export const MaintenanceMode = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Maintenance Mode</CardTitle>
          <CardDescription>
            We're currently performing scheduled maintenance to improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            SwapBoard is temporarily unavailable while we make some improvements. 
            We'll be back online shortly!
          </p>
          <p className="text-sm text-gray-500">
            Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
