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
    <section className="relative overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
      {/* Kente pattern border at top */}
      <div className="kente-border w-full"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      ></div>
      
      {/* Background overlay with African theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-primary/10 to-secondary/20"></div>
      
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 lg:py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            
            {/* Left Content */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <Badge 
                variant="secondary" 
                className="inline-flex mb-1 sm:mb-2 md:mb-4 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs font-medium animate-fade-in bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              >
                🇬🇭 Ghana Marketplace
              </Badge>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight text-foreground">
                <span className="block mb-1 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">Buy, Sell,</span>
                <span className="block text-primary animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">Ghana Style.</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-6 md:mb-8 max-w-lg animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards] leading-relaxed">
                Join Ghana's fastest-growing marketplace. Buy and sell locally with trusted sellers. Mobile money payments supported.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards]">
                <Button 
                  size="lg" 
                  onClick={onBrowseItems}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold px-4 sm:px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 group w-full sm:w-auto min-h-[44px] touch-target"
                >
                  Browse Items
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onPostItem}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 sm:px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold transition-all duration-300 hover:scale-105 w-full sm:w-auto min-h-[44px] touch-target"
                >
                  Sell Something
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 pt-2 sm:pt-3 md:pt-4 text-xs sm:text-xs md:text-sm text-white animate-fade-in animate-delay-900 opacity-0 [animation-fill-mode:forwards]">
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Shield className="h-4 w-4 text-white" />
                  100% Secure Trading
                </span>
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Smartphone className="h-4 w-4 text-white" />
                  Mobile Money Ready
                </span>
                <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
                  <Users className="h-4 w-4 text-white" />
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