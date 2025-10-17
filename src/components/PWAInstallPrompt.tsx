import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  // Don't show if already installed or not on mobile
  if (isInstalled || !isMobile) return null;

  // Show iOS-specific install instructions
  if (isIOS) {
    return (
      <Button
        variant="ghost"
        size="lg"
        className="text-white border bg-emerald-600 w-full border-white/95 hover:bg-emerald-500 backdrop-blur-sm gap-2"
        onClick={() => {
          alert('To install this app on iOS:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right');
        }}
      >
        <Smartphone className="h-4 w-4" />
        Install App
      </Button>
    );
  }

  // Show install button for Android/Chrome if prompt is available
  if (deferredPrompt) {
    return (
      <Button
        variant="ghost"
        size="lg"
        className="text-white border bg-emerald-600 w-full border-white/95 hover:bg-emerald-500 backdrop-blur-sm gap-2"
        onClick={handleInstallClick}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    );
  }

  return null;
};
