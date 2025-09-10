import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  User, 
  MapPin, 
  Package, 
  Star, 
  ArrowRight, 
  Gift,
  TrendingUp,
  Shield,
  MessageSquare
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  icon: any;
}

export const SellerOnboarding = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id);

      if (listingsError) throw listingsError;
      setListings(listingsData || []);

      // Show onboarding if user is new (no listings and incomplete profile)
      const isNewSeller = (listingsData?.length || 0) === 0 && 
                         (!profileData?.location || !profileData?.bio);
      setShowOnboarding(isNewSeller);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your location, bio, and contact information to build trust with buyers',
      completed: !!(profile?.location && profile?.bio),
      action: () => navigate('/profile'),
      icon: User
    },
    {
      id: 'location',
      title: 'Set Your Location',
      description: 'Help buyers find you by setting your city and region',
      completed: !!(profile?.region && profile?.city),
      action: () => navigate('/profile'),
      icon: MapPin
    },
    {
      id: 'first_listing',
      title: 'Post Your First Item',
      description: 'Create your first listing to start selling on the marketplace',
      completed: listings.length > 0,
      action: () => navigate('/post'),
      icon: Package
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const completeOnboarding = async () => {
    try {
      // Mark onboarding as completed in user profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          achievements: [...(profile?.achievements || []), 'onboarding_completed']
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Welcome to the Marketplace!",
        description: "You're all set up and ready to start selling. Good luck with your first sales!",
      });

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!showOnboarding) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            Welcome to Ghana's #1 Marketplace!
          </CardTitle>
          <CardDescription className="text-lg">
            Let's get you set up to start selling successfully. Complete these steps to maximize your sales potential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{completedSteps}/{steps.length} completed</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <div className="grid gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${step.completed ? 'bg-green-100' : 'bg-primary/10'}`}>
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <StepIcon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        {step.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {!step.completed && step.action && (
                    <Button onClick={step.action} className="ml-4">
                      {step.id === 'first_listing' ? 'Post Item' : 'Complete'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Why Complete Your Setup?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Shield className="w-8 h-8 mx-auto text-primary" />
              <h4 className="font-semibold">Build Trust</h4>
              <p className="text-sm text-muted-foreground">Complete profiles get 3x more inquiries from serious buyers</p>
            </div>
            <div className="text-center space-y-2">
              <Star className="w-8 h-8 mx-auto text-primary" />
              <h4 className="font-semibold">Better Rankings</h4>
              <p className="text-sm text-muted-foreground">Complete listings appear higher in search results</p>
            </div>
            <div className="text-center space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-primary" />
              <h4 className="font-semibold">More Sales</h4>
              <p className="text-sm text-muted-foreground">Sellers with complete profiles sell 5x faster</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Button */}
      {completedSteps === steps.length && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              You've completed all the setup steps. You're ready to start selling successfully!
            </p>
            <Button onClick={completeOnboarding} size="lg" className="bg-green-600 hover:bg-green-700">
              Start Selling Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};