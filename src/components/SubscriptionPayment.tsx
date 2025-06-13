
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Check, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SubscriptionPayment = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscription = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Stripe",
          description: "Complete your subscription in the new tab.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Customer Portal",
          description: "Manage your subscription in the new tab.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  if (user.membershipType === 'premium') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            Premium Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge className="mb-4">Active Subscription</Badge>
            <p className="text-sm text-gray-600 mb-4">
              You have unlimited listings and swaps!
            </p>
            <Button 
              onClick={handleManageSubscription}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-gray-600">Get unlimited listings and swaps</p>
      </div>

      <Card className="relative border-2 border-emerald-500">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-emerald-500">Popular Choice</Badge>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Premium Plan
            <Badge variant="outline">$7.99/month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm">Unlimited listings</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm">Unlimited swaps</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm">Priority support</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm">Advanced analytics</span>
            </div>
          </div>
          <Button 
            onClick={handleSubscription}
            disabled={isProcessing}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <ExternalLink className="w-4 h-4 mr-2" />
            Subscribe Now
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>Current usage: {user.monthlyListings}/10 listings, {user.monthlySwaps}/20 swaps</p>
        <p className="mt-1">Secure payments powered by Stripe</p>
      </div>
    </div>
  );
};
