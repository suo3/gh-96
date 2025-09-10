import { AppHeader } from "@/components/AppHeader";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Subscription = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        userLocation={null}
        onLocationDetect={() => {}}
        onPostItem={() => navigate('/post-item')}
        onLogoClick={() => navigate('/')}
      />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Subscription features are currently not available.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;