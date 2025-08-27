import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Zap, Smartphone } from "lucide-react";
import { useCoinPricing, usePlatformCosts } from "@/hooks/useCoinPricing";

const MOBILE_PROVIDERS = [
  { id: "mtn", name: "MTN Mobile Money", prefixes: ["024", "054", "055", "059"] },
  { id: "vodafone", name: "Vodafone Cash", prefixes: ["020", "050"] },
  { id: "airteltigo", name: "AirtelTigo Money", prefixes: ["027", "057", "026", "056"] }
];

export const MobileMoneyPayment = () => {
  const { data: pricingPlans = [], isLoading: loadingPricing } = useCoinPricing();
  const { data: platformCosts } = usePlatformCosts();
  const { user, purchaseMobileMoneyCoins, refreshUserProfile } = useAuthStore();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");

  const handlePurchase = async (plan: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase coins.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || !provider) {
      toast({
        title: "Payment Details Required",
        description: "Please enter your phone number and select your mobile money provider.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const selectedProvider = MOBILE_PROVIDERS.find(p => p.id === provider);
    const isValidNumber = selectedProvider?.prefixes.some(prefix => 
      cleanPhone.startsWith(prefix) && cleanPhone.length === 10
    );

    if (!isValidNumber) {
      toast({
        title: "Invalid Phone Number",
        description: `Please enter a valid ${selectedProvider?.name} number.`,
        variant: "destructive",
      });
      return;
    }

    setProcessingPlan(plan.id);
    
    try {
      const success = await purchaseMobileMoneyCoins(plan.coins, plan.plan_id, cleanPhone, provider);
      
      if (success) {
        toast({
          title: "Payment Completed",
          description: `Successfully added ${plan.coins} coins to your account! Payment of GHS ${plan.price} processed.`,
        });
        // Refresh user profile to update coin balance
        refreshUserProfile();
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
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              Current Balance: {user.coins} coins
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Money Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">Select Your Mobile Money Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your provider" />
              </SelectTrigger>
              <SelectContent>
                {MOBILE_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., 0244123456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={10}
            />
            {provider && (
              <p className="text-sm text-muted-foreground mt-1">
                {MOBILE_PROVIDERS.find(p => p.id === provider)?.name} numbers: {
                  MOBILE_PROVIDERS.find(p => p.id === provider)?.prefixes.join(", ")
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative border-2 transition-all hover:shadow-lg ${
              plan.is_popular 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
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
              <div className="text-lg font-semibold mt-2">
                GHS {(plan.price / plan.coins).toFixed(2)} per coin
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                GHS {plan.price}
              </div>
              
              <LoadingButton 
                onClick={() => handlePurchase(plan)}
                loading={processingPlan === plan.id}
                loadingText="Processing..."
                className={`w-full mb-4 ${plan.is_popular ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                disabled={!phoneNumber || !provider}
              >
                Purchase {plan.name}
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
        <p>• {platformCosts?.saleCost || 2} coins = 1 sale opportunity</p>
        <p>• Current balance: {user.coins} coins</p>
        <p>• Payment via mobile money (MTN, Vodafone Cash, AirtelTigo)</p>
      </div>
    </div>
  );
};