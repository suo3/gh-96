import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield, Star, MapPin, Heart } from "lucide-react";

interface HeroSectionProps {
  onPostItem: () => void;
  onBrowseItems: () => void;
}

export const HeroSection = ({ onPostItem, onBrowseItems }: HeroSectionProps) => {
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { number: "50K+", label: "Active Traders", icon: Users },
    { number: "200K+", label: "Items Swapped", icon: Heart },
    { number: "16", label: "Regions Covered", icon: MapPin },
    { number: "4.9", label: "User Rating", icon: Star }
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Mobile Money Ready",
      description: "MTN MoMo, Vodafone Cash & AirtelTigo Money supported"
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description: "Verified profiles with secure peer-to-peer trading"
    },
    {
      icon: Users,
      title: "Ghana Community",
      description: "Connect locally from Accra to Kumasi and beyond"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-ghana"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        {/* Main Hero Content */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <Badge 
            variant="secondary" 
            className="mb-8 px-6 py-3 text-base font-medium animate-fade-in bg-primary/10 border border-primary/20 text-primary"
          >
            🇬🇭 Ghana's Premier Trading Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 animate-slide-up leading-tight">
            <span className="text-primary block mb-2">Trade Smart,</span>
            <span className="text-primary block mb-2">Live Local</span>
            <span className="text-foreground block text-4xl md:text-5xl lg:text-6xl">in Ghana</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in delay-300 leading-relaxed">
            Join thousands of Ghanaians trading everything from electronics to fashion. 
            Safe, local, and powered by mobile money for seamless transactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in delay-500">
            <Button 
              size="lg" 
              onClick={onPostItem}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-gold border-0"
            >
              Start Trading Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBrowseItems}
              className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary bg-background/80 backdrop-blur-sm px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105"
            >
              Explore Marketplace
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in delay-700">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              100% Secure Trading
            </span>
            <span className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Mobile Money Ready
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              50K+ Active Users
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={stat.label}
                className={`p-8 text-center bg-gradient-card border-0 shadow-elegant hover:shadow-ghana transition-all duration-500 hover:-translate-y-2 group ${
                  animateStats ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150 + 800}ms` }}
              >
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mx-auto mb-4 w-fit">
                  <IconComponent className="h-10 w-10 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {stat.number}
                </div>
                <div className="text-base text-muted-foreground font-semibold">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                className={`p-10 bg-gradient-card border border-border/20 shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-3 group animate-fade-in relative overflow-hidden`}
                style={{ animationDelay: `${index * 200 + 1200}ms` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-ghana opacity-10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-ghana/10 group-hover:bg-gradient-ghana/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/10 rounded-full animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};