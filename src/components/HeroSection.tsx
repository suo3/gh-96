import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Users, Shield } from "lucide-react";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10"></div>
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
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="text-primary block mb-2 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">Your Marketplace,</span>
            <span className="text-primary block mb-2 animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">Your Community,</span>
            <span className="text-foreground block text-4xl md:text-5xl lg:text-6xl animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards]">Your Ghana</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards] leading-relaxed">
            Where every Ghanaian finds what they need, sells what they love, and builds connections that last. 
            From Accra to Tamale - trade with trust, powered by mobile money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in animate-delay-1000 opacity-0 [animation-fill-mode:forwards]">
            <Button 
              size="lg" 
              onClick={onPostItem}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-gold border-0 group"
            >
              Start Trading Now
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBrowseItems}
              className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary bg-background/80 backdrop-blur-sm px-10 py-5 text-xl font-bold transition-all duration-300 hover:scale-105 group"
            >
              Explore Marketplace
              <ArrowRight className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in animate-delay-1200 opacity-0 [animation-fill-mode:forwards]">
            <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Shield className="h-4 w-4 text-primary animate-pulse" />
              100% Secure Trading
            </span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Smartphone className="h-4 w-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
              Mobile Money Ready
            </span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
              <Users className="h-4 w-4 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
              50K+ Active Users
            </span>
          </div>
        </div>


        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                className={`p-10 bg-card border border-primary/10 shadow-elegant hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-3 group animate-fade-in relative overflow-hidden`}
                style={{ animationDelay: `${index * 200 + 1200}ms` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce-slow"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-5 w-12 h-12 bg-primary/10 rounded-full animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
    </section>
  );
};