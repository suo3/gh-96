
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/use-toast";
import { Crown, Check, Loader2 } from "lucide-react";

export const SubscriptionPayment = () => {
  const { user, processSubscriptionPayment } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscription = async (planType: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    
    try {
      const success = await processSubscriptionPayment(planType);
      
      if (success) {
        toast({
          title: "Subscription Activated!",
          description: `You now have unlimited listings and swaps with the ${planType} plan!`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
        <CardContent>
          <div className="text-center">
            <Badge className="mb-4">Active Subscription</Badge>
            <p className="text-sm text-gray-600">
              You have unlimited listings and swaps!
            </p>
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Monthly Plan
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
            </div>
            <Button 
              onClick={() => handleSubscription('monthly')}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Subscribe Monthly
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-emerald-500">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-500">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Yearly Plan
              <Badge variant="outline">$79.99/year</Badge>
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
                <span className="text-sm font-medium text-emerald-600">Save 17%</span>
              </div>
            </div>
            <Button 
              onClick={() => handleSubscription('yearly')}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Subscribe Yearly
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Current usage: {user.monthlyListings}/10 listings, {user.monthlySwaps}/20 swaps</p>
      </div>
    </div>
  );
};
