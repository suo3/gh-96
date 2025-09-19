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
    <section className="relative overflow-hidden bg-background">
      {/* Kente pattern border at top */}
      <div className="kente-border w-full"></div>
      
      {/* Main hero content */}
      <div className="bg-background min-h-[600px] relative">
        {/* Market stall illustration area */}
        <div className="absolute right-8 lg:right-16 top-8 lg:top-16">
          <div className="relative">
            {/* Market stall */}
            <div className="w-48 lg:w-64 h-48 lg:h-64 relative">
              {/* Awning */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 lg:w-52 h-8 lg:h-10 bg-gradient-to-r from-secondary via-accent to-secondary rounded-t-3xl border-b-4 border-primary"></div>
              <div className="absolute top-6 lg:top-8 left-1/2 transform -translate-x-1/2 w-36 lg:w-48 h-6 lg:h-8 bg-primary rounded-full"></div>
              
              {/* Store front */}
              <div className="absolute top-12 lg:top-16 left-1/2 transform -translate-x-1/2 w-32 lg:w-40 h-32 lg:w-40 bg-card rounded-lg border-2 border-border">
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
              <div className="absolute top-20 lg:top-24 -left-4 w-8 lg:w-10 h-12 lg:h-16 bg-secondary rounded-lg border border-border"></div>
              <div className="absolute top-28 lg:top-32 -left-2 w-6 lg:w-8 h-10 lg:h-12 bg-accent rounded-lg border border-border"></div>
            </div>
          </div>
        </div>
      
        
        <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
          <div className="max-w-2xl">
            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary">
              <span className="block">Buy, Sell,</span>
              <span className="block">Ghana Style.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md leading-relaxed">
              Connecting ang hakekara Marketplace, Connecton n'allere. Fhana stylers
            </p>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={onBrowseItems}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 hover:scale-105"
              >
                Coretian
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={onPostItem}
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 hover:scale-105"
              >
                Scotia
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Listings Section */}
      <div className="bg-card rounded-t-3xl mx-4 lg:mx-8 -mt-8 relative z-20 shadow-elegant">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-primary">Featured Listing SIlyle.</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full">Calrion</Button>
              <Button variant="default" size="sm" className="rounded-full bg-primary">Gooloin</Button>
            </div>
          </div>
          
          {/* Featured Stores Spotlight in card layout */}
          <div className="relative">
            <FeaturedStoresSpotlight />
          </div>
        </div>
      </div>
    </section>
  );
};