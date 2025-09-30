import { Helmet } from "react-helmet";
import { SellerOnboarding as SellerOnboardingComponent } from "@/components/SellerOnboarding";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

export default function SellerOnboarding() {
  const navigate = useNavigate();

  const handleLogoClick = () => navigate("/");
  const handlePostItem = () => navigate("/post-item");
  const handleLocationDetect = () => {};

  return (
    <>
      <Helmet>
        <title>Seller Setup - Ghana Marketplace</title>
        <meta 
          name="description" 
          content="Complete your seller profile setup to start selling successfully on Ghana's #1 marketplace platform." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={handleLocationDetect}
          onPostItem={handlePostItem}
          onLogoClick={handleLogoClick}
        />
        <main className="container mx-auto py-8">
          <SellerOnboardingComponent />
        </main>
        <Footer />
      </div>
    </>
  );
}