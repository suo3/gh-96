import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Zap } from "lucide-react";
import { useCoinPricing, usePlatformCosts } from "@/hooks/useCoinPricing";

export const SubscriptionPayment = () => {
  const { data: pricingPlans = [], isLoading: loadingPricing } = useCoinPricing();
  const { data: platformCosts } = usePlatformCosts();
  const { user, purchaseCoins } = useAuthStore();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handlePurchase = async (plan: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase coins.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPlan(plan.id);
    
    try {
      const success = await purchaseCoins(plan.coins, plan.plan_id);
      
      if (success) {
        toast({
          title: "Payment Initiated",
          description: "You will be redirected to complete the payment.",
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "There was an issue processing the payment. Please try again.",
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
      setProcessingPlan(null);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please log in to purchase coins.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingPricing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Loading pricing plans...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Purchase Swap Coins</h2>
        <p className="text-muted-foreground">Get more coins to post listings and make swaps</p>
        <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-emerald-700">
              Current Balance: {user.coins} coins
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative border-2 transition-all hover:shadow-lg ${
              plan.is_popular 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            {plan.is_popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              {plan.savings && (
                <Badge variant="secondary" className="w-fit mx-auto">
                  {plan.savings}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {plan.coins}
              </div>
              <div className="text-sm text-muted-foreground">Coins</div>
              <div className="text-lg font-semibold mt-2 mb-4">
                ${(plan.price / plan.coins * 0.55).toFixed(2)} per coin
              </div>
              
              <LoadingButton 
                onClick={() => handlePurchase(plan)}
                loading={processingPlan === plan.id}
                loadingText="Processing..."
                className={`w-full mb-4 ${plan.is_popular ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              >
                Buy for ${(plan.price * 0.55).toFixed(2)}
              </LoadingButton>
              
              <div className="text-left text-sm text-muted-foreground">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center mb-1">
                    <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>• {platformCosts?.listingCost || 1} coin = 1 listing post</p>
        <p>• {platformCosts?.swapCost || 2} coins = 1 swap opportunity</p>
        <p>• Current balance: {user.coins} coins</p>
      </div>
    </div>
  );
};