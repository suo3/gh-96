import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield } from "lucide-react";
import { FeaturedStoresSpotlight } from "./FeaturedStoresSpotlight";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroSectionProps {
  onPostItem: () => void;
  onBrowseItems: () => void;
}

export const HeroSection = ({ onPostItem, onBrowseItems }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
      {/* Kente pattern border at top */}
      <div className="kente-border w-full"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      ></div>
      
      {/* Background overlay with African theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-primary/10 to-secondary/20"></div>
      
      {/* Market stall illustration area */}
      <div className="absolute right-8 lg:right-16 top-16 lg:top-24 z-10">
        <div className="relative">
          {/* Market stall */}
          <div className="w-48 lg:w-64 h-48 lg:h-64 relative">
            {/* Awning */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 lg:w-52 h-8 lg:h-10 bg-gradient-to-r from-secondary via-accent to-secondary rounded-t-3xl border-b-4 border-primary"></div>
            <div className="absolute top-6 lg:top-8 left-1/2 transform -translate-x-1/2 w-36 lg:w-48 h-6 lg:h-8 bg-primary rounded-full"></div>
            
            {/* Store front */}
            <div className="absolute top-12 lg:top-16 left-1/2 transform -translate-x-1/2 w-32 lg:w-40 h-32 lg:w-40 bg-card/90 backdrop-blur-sm rounded-lg border-2 border-border">
              {/* Clothing items */}
              <div className="flex justify-center items-center h-full p-2">
                <div className="grid grid-cols-3 gap-1 w-full">
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-secondary rounded-sm"></div>
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-accent rounded-sm"></div>
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-secondary rounded-sm"></div>
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-accent rounded-sm"></div>
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-destructive rounded-sm"></div>
                  <div className="w-6 lg:w-8 h-8 lg:h-10 bg-accent rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Bags on side */}
            <div className="absolute top-20 lg:top-24 -left-4 w-8 lg:w-10 h-12 lg:h-16 bg-secondary/90 backdrop-blur-sm rounded-lg border border-border"></div>
            <div className="absolute top-28 lg:top-32 -left-2 w-6 lg:w-8 h-10 lg:h-12 bg-accent/90 backdrop-blur-sm rounded-lg border border-border"></div>
          </div>
        </div>
      </div>
      
        
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            
            {/* Left Content */}
            <div className="space-y-4 md:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <Badge 
                variant="secondary" 
                className="inline-flex mb-2 md:mb-4 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium animate-fade-in bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              >
                🇬🇭 Ghana Marketplace
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight text-foreground">
                <span className="block mb-1 md:mb-2 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">Buy, Sell,</span>
                <span className="block text-primary animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">Ghana Style.</span>
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-lg animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards] leading-relaxed">
                Join Ghana's fastest-growing marketplace. Buy and sell locally with trusted sellers. Mobile money payments supported.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards]">
                <Button 
                  size="lg" 
                  onClick={onBrowseItems}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
                >
                  Browse Items
                  <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onPostItem}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Sell Something
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 md:gap-6 pt-3 md:pt-4 text-xs md:text-sm text-muted-foreground animate-fade-in animate-delay-900 opacity-0 [animation-fill-mode:forwards]">
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Shield className="h-4 w-4 text-primary" />
                  100% Secure Trading
                </span>
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Mobile Money Ready
                </span>
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Users className="h-4 w-4 text-primary" />
                  50K+ Active Users
                </span>
              </div>
            </div>
            
            {/* Featured Stores Spotlight */}
            <div className="relative order-1 lg:order-2 animate-fade-in animate-delay-200 opacity-0 [animation-fill-mode:forwards]">
              <FeaturedStoresSpotlight />
            </div>
            
          </div>
        </div>
      </section>
  );
};