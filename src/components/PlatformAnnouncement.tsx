
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PlatformAnnouncementProps {
  message: string;
}

export const PlatformAnnouncement = ({ message }: PlatformAnnouncementProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) {
    return null;
  }

  return (
    <Alert className="bg-blue-50 border-blue-200 mb-4">
      <Megaphone className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-800">{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
