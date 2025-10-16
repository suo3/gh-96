import { UserProfile } from "@/components/UserProfile";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

const Profile = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <AppHeader 
        userLocation={null}
        onLocationDetect={() => {}}
        onPostItem={() => navigate('/marketplace')}
        onLogoClick={() => navigate('/')}
      />
      <UserProfile onBack={handleBack} />
      <Footer />
    </>
  );
};

export default Profile;
