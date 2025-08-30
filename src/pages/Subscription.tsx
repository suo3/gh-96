import { MobileMoneyPayment } from "@/components/MobileMoneyPayment";
import { AppHeader } from "@/components/AppHeader";
import { useNavigate } from "react-router-dom";

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
        <MobileMoneyPayment />
      </div>
    </div>
  );
};

export default Subscription;