import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Zap, Smartphone } from "lucide-react";

const mobileMoneyProviders = [
  { id: "mtn", name: "MTN Mobile Money", prefix: "024,054,055,059" },
  { id: "vodafone", name: "Vodafone Cash", prefix: "020,050" },
  { id: "airteltigo", name: "AirtelTigo Money", prefix: "027,057,026,056" }
];

export const MobileMoneyPayment = () => {
  const { user, purchaseMobileMoneyCoins } = useAuthStore();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");

  const validatePhoneNumber = (number: string, selectedProvider: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    const provider = mobileMoneyProviders.find(p => p.id === selectedProvider);
    
    if (!provider) return false;
    
    const prefixes = provider.prefix.split(',');
    return prefixes.some(prefix => cleanNumber.startsWith(prefix)) && cleanNumber.length === 10;
  };

  const handlePurchase = async (coinAmount: number, price: string, planType: string) => {
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
        title: "Missing Information",
        description: "Please enter your mobile money phone number and select a provider.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phoneNumber, provider)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number for the selected provider.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPlan(planType);
    
    try {
      const success = await purchaseMobileMoneyCoins(coinAmount, planType, phoneNumber, provider);
      
      if (success) {
        toast({
          title: "Payment Request Sent",
          description: "Check your phone for the mobile money prompt to complete payment.",
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
          <p className="text-center text-gray-600">
            Please log in to purchase coins.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Purchase Swap Coins</h2>
        <p className="text-gray-600">Pay with Mobile Money to get coins for listings and swaps</p>
        <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-emerald-700">
              Current Balance: {user.coins} coins
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Money Details */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Money Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">Mobile Money Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select your mobile money provider" />
              </SelectTrigger>
              <SelectContent>
                {mobileMoneyProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="phone">Mobile Money Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 0541234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1"
            />
            {provider && (
              <p className="text-sm text-gray-500 mt-1">
                {mobileMoneyProviders.find(p => p.id === provider)?.name} numbers start with: {mobileMoneyProviders.find(p => p.id === provider)?.prefix}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Starter Pack
              <Badge variant="outline">GHS 20</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">GHS 0.80 per coin</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">25 listing posts</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">12 swap opportunities</span>
              </div>
            </div>
            <LoadingButton 
              onClick={() => handlePurchase(25, "GHS 20", "starter")}
              loading={processingPlan === "starter"}
              loadingText="Processing..."
              className="w-full"
            >
              Pay with Mobile Money
            </LoadingButton>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-emerald-500">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-500">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Value Pack
              <Badge variant="outline">GHS 40</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">60</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">GHS 0.67 per coin</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">60 listing posts</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">30 swap opportunities</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-sm font-medium text-emerald-600">Save 15%</span>
              </div>
            </div>
            <LoadingButton 
              onClick={() => handlePurchase(60, "GHS 40", "value")}
              loading={processingPlan === "value"}
              loadingText="Processing..."
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              Pay with Mobile Money
            </LoadingButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Power Pack
              <Badge variant="outline">GHS 80</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">150</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">GHS 0.53 per coin</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">150 listing posts</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">75 swap opportunities</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-purple-600">Save 35%</span>
              </div>
            </div>
            <LoadingButton 
              onClick={() => handlePurchase(150, "GHS 80", "power")}
              loading={processingPlan === "power"}
              loadingText="Processing..."
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Pay with Mobile Money
            </LoadingButton>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>• 1 coin = 1 listing post</p>
        <p>• 2 coins = 1 swap opportunity</p>
        <p>• Current balance: {user.coins} coins</p>
        <p className="text-xs mt-2">You will receive a prompt on your phone to authorize the payment</p>
      </div>
    </div>
  );
};