import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Rocket, Gift } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const SellerOnboardingBanner = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkIfShouldShowBanner();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkIfShouldShowBanner = async () => {
    if (!user) return;

    try {
      // Check if user has any listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (listingsError) throw listingsError;

      // Check if user has completed profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('location, bio, achievements')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Show banner if user has no listings AND incomplete profile AND hasn't completed onboarding
      const hasListings = (listings?.length || 0) > 0;
      const hasCompleteProfile = !!(profile?.location && profile?.bio);
      const hasCompletedOnboarding = profile?.achievements?.includes('onboarding_completed');

      setShowBanner(!hasListings && !hasCompleteProfile && !hasCompletedOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setShowBanner(false);
    
    // Optionally mark banner as dismissed in user preferences
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('achievements')
        .eq('id', user?.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            achievements: [...(profile.achievements || []), 'banner_dismissed']
          })
          .eq('id', user?.id);
      }
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  if (loading || !showBanner || !user) {
    return null;
  }

  return (
    <Card className="mx-4 mt-3 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary/20 rounded-full">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Start Selling Today!
              </h3>
              <p className="text-muted-foreground mt-1">
                Complete your seller setup to unlock all marketplace features and start earning.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/seller-onboarding')}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};