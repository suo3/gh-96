
import { MessagesPanel } from "@/components/MessagesPanel";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/?login=true");
  };

  return (
    <>
      <MessagesPanel onBack={handleBack} onLogin={handleLogin} />
      <Footer />
    </>
  );
};

export default Messages;
