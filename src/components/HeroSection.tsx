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
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      ></div>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/40"></div>
      
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
      
      {/* Floating Elements - Hidden on mobile */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce-slow"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-16 h-16 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      <div className="hidden lg:block absolute top-1/2 left-5 w-12 h-12 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};