import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Home, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log 404 for monitoring in production (can be sent to analytics service)
    console.error("404 Error: Route not found:", window.location.pathname);
  }, []);

  return (
    <>
      <AppHeader 
        userLocation={null}
        onLocationDetect={() => {}}
        onPostItem={() => navigate('/post')}
        onLogoClick={() => navigate('/')}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 pt-24">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-600">404</span>
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Sorry, the page you're looking for doesn't exist or may have been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </>
  );
};

export default NotFound;