import { Link } from "react-router-dom";
import { Smartphone, Play } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border border-t-emerald-600 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 KenteKart. All rights reserved.
            </p>
          </div>
          
          {/* Mobile Apps Coming Soon */}
         {/*  <div hidden className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">iOS App</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Coming Soon</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <Play className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Android App</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Coming Soon</span>
            </div>
          </div> */}
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Contact & Support
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