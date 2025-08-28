
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PostItemDialog } from "@/components/PostItemDialog";
import { Footer } from "@/components/Footer";

const PostItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // If dialog is closed, navigate back
    if (!isOpen) {
      navigate("/");
    }
  }, [isOpen, navigate]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate("/");
    }
  };

  return (
    <>
      <PostItemDialog 
        open={isOpen} 
        onOpenChange={handleOpenChange} 
      />
      <Footer />
    </>
  );
};

export default PostItem;
