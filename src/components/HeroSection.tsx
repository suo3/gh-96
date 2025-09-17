import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield } from "lucide-react";
import heroWoman from "@/assets/hero-woman.jpg";

interface HeroSectionProps {
  onPostItem: () => void;
  onBrowseItems: () => void;
}

export const HeroSection = ({ onPostItem, onBrowseItems }: HeroSectionProps) => {


  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 min-h-[600px] lg:min-h-[700px]">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20"></div>
      
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[600px]">
          
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <Badge 
              variant="secondary" 
              className="inline-flex mb-4 px-4 py-2 text-sm font-medium animate-fade-in bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
            >
              Instructions For Today
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight text-foreground">
              <span className="block mb-2 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">Buy, Sell,</span>
              <span className="block text-primary animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">Ghana Style.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-lg animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards] leading-relaxed">
              People prefer purchasing and selling authentically Ghanaian products from local entrepreneurs. Find trusted sellers and great deals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards]">
              <Button 
                size="lg" 
                onClick={onBrowseItems}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 group"
              >
                Chop Reviews
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={onPostItem}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105"
              >
                Join Today
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground animate-fade-in animate-delay-900 opacity-0 [animation-fill-mode:forwards]">
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
          
          {/* Right Image */}
          <div className="relative order-1 lg:order-2 animate-fade-in animate-delay-200 opacity-0 [animation-fill-mode:forwards]">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroWoman} 
                alt="Smiling Ghanaian woman in traditional clothing at a marketplace"
                className="w-full h-[400px] lg:h-[500px] xl:h-[600px] object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              
              {/* Floating elements */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Smart Laycon</p>
                      <p className="text-xs text-muted-foreground">₵150</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>
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