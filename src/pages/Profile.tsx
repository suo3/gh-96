
import { UserProfile } from "@/components/UserProfile";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <UserProfile onBack={handleBack} />;
};

export default Profile;
