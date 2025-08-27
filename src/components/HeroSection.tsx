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
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "200K+", label: "Items Swapped", icon: Heart },
    { number: "16", label: "Regions Covered", icon: MapPin },
    { number: "4.8", label: "User Rating", icon: Star }
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Mobile Money Integration",
      description: "MTN Mobile Money & Vodafone Cash supported"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified users and secure transactions"
    },
    {
      icon: Users,
      title: "Local Community",
      description: "Connect with neighbors across Ghana"
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
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge 
            variant="secondary" 
            className="mb-6 px-4 py-2 text-sm font-medium shadow-gold animate-fade-in"
          >
            🇬🇭 Ghana's #1 Marketplace
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-gradient-ghana">Swap, Trade & </span>
            <br />
            <span className="text-foreground">Connect Locally</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in delay-300">
            Ghana's premier marketplace for sustainable trading. Connect with your community, 
            swap items safely, and support local commerce with mobile money payments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-500">
            <Button 
              size="lg" 
              onClick={onPostItem}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-ghana px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Post Your Item
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBrowseItems}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Browse Items
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={stat.label}
                className={`p-6 text-center bg-gradient-card border-0 shadow-elegant hover:shadow-ghana transition-all duration-300 hover:-translate-y-1 ${
                  animateStats ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 100 + 800}ms` }}
              >
                <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                className={`p-8 bg-gradient-card border-0 shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-2 group animate-fade-in`}
                style={{ animationDelay: `${index * 200 + 1200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                    <IconComponent className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
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