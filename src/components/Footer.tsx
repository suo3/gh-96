import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 KenteKart. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              About Us
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/trademark" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Trademark
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};