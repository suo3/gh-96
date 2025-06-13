
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initialize } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Refresh user data to get updated membership status
      initialize();
      
      toast({
        title: "Payment Successful!",
        description: "Welcome to Premium! Your account has been upgraded.",
      });
    }
  }, [searchParams, initialize, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Premium Activated!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Congratulations! Your payment was successful and you now have access to premium features.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Premium Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Unlimited listings</li>
              <li>✓ Unlimited swaps</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Continue to SwapBoard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
