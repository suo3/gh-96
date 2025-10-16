
import { MessagesPanel } from "@/components/MessagesPanel";
import { Footer } from "@/components/Footer";
import { AppHeader } from "@/components/AppHeader";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate("/?login=true");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        userLocation={null}
        onLocationDetect={() => {}}
        onPostItem={() => navigate('/marketplace')}
        onLogoClick={() => navigate('/')}
      />
      <div className="flex-1">
        <MessagesPanel onBack={handleBack} onLogin={handleLogin} />
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
