import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield, Star, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  onPostItem: () => void;
  onBrowseItems: () => void;
}

export const HeroSection = ({ onPostItem, onBrowseItems }: HeroSectionProps) => {

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
    <section className="relative bg-background min-h-screen flex items-center">
      {/* Clean background with subtle Ghana flag accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      
      <div className="container mx-auto px-4 py-20 relative">
        {/* Robinhood-style minimal hero */}
        <div className="max-w-4xl mx-auto text-left">
          <div className="mb-6">
            <Badge 
              variant="outline" 
              className="border-secondary text-secondary bg-secondary/5 px-4 py-2 text-sm font-semibold"
            >
              🇬🇭 Ghana's Trading Platform
            </Badge>
          </div>
          
          <h1 className="font-sans text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight text-foreground">
            Trade with
            <br />
            <span className="text-primary">confidence.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            The trusted marketplace for Ghana. Buy, sell, and trade with verified users across the country.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button 
              size="xl" 
              onClick={onPostItem}
              variant="ghana"
              className="shadow-lg hover:shadow-xl"
            >
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              onClick={onBrowseItems}
              className="border-border hover:bg-muted shadow-md"
            >
              Browse Items
            </Button>
          </div>
          
          {/* Clean stats section */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
            <div>
              <div className="text-3xl font-black text-foreground mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground mb-1">₵2M+</div>
              <div className="text-sm text-muted-foreground">Monthly Volume</div>
            </div>
            <div>
              <div className="text-3xl font-black text-foreground mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>


        {/* Clean features section */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const colorClasses = [
              { bg: 'bg-primary/5', icon: 'text-primary', border: 'border-primary/10' },
              { bg: 'bg-secondary/5', icon: 'text-secondary', border: 'border-secondary/10' },
              { bg: 'bg-accent/5', icon: 'text-accent', border: 'border-accent/10' },
            ];
            const colorClass = colorClasses[index];
            
            return (
              <Card 
                key={feature.title}
                className={`robinhood-card p-6 ${colorClass.bg} ${colorClass.border} hover-lift`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${colorClass.bg}`}>
                    <IconComponent className={`h-6 w-6 ${colorClass.icon}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${colorClass.icon}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};