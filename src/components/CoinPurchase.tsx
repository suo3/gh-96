
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Loader2, Zap } from "lucide-react";

export const CoinPurchase = () => {
  const { user, purchaseCoins } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (coinAmount: number, price: string, planType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase coins.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const success = await purchaseCoins(coinAmount, planType);
      
      if (success) {
        toast({
          title: "Redirecting to Payment",
          description: "You'll be redirected to Stripe to complete your payment.",
        });
      } else {
        toast({
          title: "Payment Setup Failed",
          description: "There was an issue setting up the payment. Please try again.",
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
        <p className="text-gray-600">Get more coins to post listings and make swaps</p>
        <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-emerald-700">
              Current Balance: {user.coins} coins
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Starter Pack
              <Badge variant="outline">$4.99</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">$0.20 per coin</div>
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
            <Button 
              onClick={() => handlePurchase(25, "$4.99", "starter")}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Purchase Starter Pack
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-emerald-500">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-emerald-500">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Value Pack
              <Badge variant="outline">$9.99</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">60</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">$0.17 per coin</div>
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
            <Button 
              onClick={() => handlePurchase(60, "$9.99", "value")}
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Purchase Value Pack
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Power Pack
              <Badge variant="outline">$19.99</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">150</div>
              <div className="text-sm text-gray-600">Coins</div>
              <div className="text-xs text-gray-500 mt-1">$0.13 per coin</div>
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
            <Button 
              onClick={() => handlePurchase(150, "$19.99", "power")}
              disabled={isProcessing}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Purchase Power Pack
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>• 1 coin = 1 listing post</p>
        <p>• 2 coins = 1 swap opportunity</p>
        <p>• Current balance: {user.coins} coins</p>
      </div>
    </div>
  );
};
