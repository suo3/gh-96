import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield } from "lucide-react";

interface HeroSectionProps {
  onPostItem: () => void;
  onBrowseItems: () => void;
}

export const HeroSection = ({ onPostItem, onBrowseItems }: HeroSectionProps) => {


  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 lg:py-8 relative z-10">
        {/* Main Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-4">
          <Badge 
            variant="secondary" 
            className="mb-6 md:mb-8 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium animate-fade-in bg-primary/10 border border-primary/20 text-primary"
          >
            🇬🇭 Ghana's Premier Trading Platform
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="text-primary block mb-1 md:mb-2 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">Your Marketplace,</span>
            <span className="text-primary block mb-1 md:mb-2 animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">Your Community,</span>
            <span className="text-foreground block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards]">Your Ghana</span>
          </h1>
          
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-10 max-w-3xl mx-auto animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards] leading-relaxed px-4">
            Where every Ghanaian finds what they need, sells what they love, and builds connections that last. 
            From Accra to Tamale - trade with trust, powered by mobile money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center animate-fade-in animate-delay-1000 opacity-0 [animation-fill-mode:forwards] px-4">
            <Button 
              size="lg" 
              onClick={onPostItem}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant px-6 py-4 md:px-10 md:py-5 text-lg md:text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-gold border-0 group w-full sm:w-auto"
            >
              Start Trading Now
              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBrowseItems}
              className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary bg-background/80 backdrop-blur-sm px-6 py-4 md:px-10 md:py-5 text-lg md:text-xl font-bold transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
            >
              Explore Marketplace
              <ArrowRight className="ml-2 md:ml-3 h-4 w-4 md:h-5 md:w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground animate-fade-in animate-delay-1200 opacity-0 [animation-fill-mode:forwards] px-4">
            <span className="flex items-center gap-1 md:gap-2 hover:text-primary transition-colors duration-300">
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
              100% Secure Trading
            </span>
            <span className="flex items-center gap-1 md:gap-2 hover:text-primary transition-colors duration-300">
              <Smartphone className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
              Mobile Money Ready
            </span>
            <span className="flex items-center gap-1 md:gap-2 hover:text-primary transition-colors duration-300">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
              50K+ Active Users
            </span>
          </div>
        </div>


      </div>
      
      {/* Floating Elements - Hidden on mobile */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce-slow"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-16 h-16 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      <div className="hidden lg:block absolute top-1/2 left-5 w-12 h-12 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};