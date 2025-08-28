
import { UserProfile } from "@/components/UserProfile";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <UserProfile onBack={handleBack} />
      <Footer />
    </>
  );
};

export default Profile;
