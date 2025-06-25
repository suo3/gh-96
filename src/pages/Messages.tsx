
import { MessagesPanel } from "@/components/MessagesPanel";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/?login=true");
  };

  return <MessagesPanel onBack={handleBack} onLogin={handleLogin} />;
};

export default Messages;
