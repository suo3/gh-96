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
    <section className="relative overflow-hidden bg-gradient-hero min-h-screen flex items-center">
      {/* Retro Ghana Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-ghana-flag"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-ghana-flag"></div>
      </div>
      
      {/* Kente-inspired decorative elements */}
      <div className="absolute top-8 left-8 w-32 h-32 bg-gradient-retro-gold rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-8 right-8 w-24 h-24 bg-primary/20 rounded-full opacity-30 animate-bounce-slow"></div>
      <div className="absolute top-1/2 right-16 w-16 h-16 bg-accent/20 rounded-full opacity-40"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Robinhood-style Hero */}
        <div className="text-center max-w-6xl mx-auto mb-16">
          <Badge 
            variant="secondary" 
            className="mb-8 px-8 py-4 text-lg font-bold animate-fade-in bg-gradient-retro-gold text-foreground border-0 shadow-ghana-gold retro-glow"
          >
            <Star className="w-5 h-5 mr-2" />
            🇬🇭 Ghana's #1 Trading Platform
          </Badge>
          
          <h1 className="font-retro text-6xl md:text-8xl lg:text-9xl font-black mb-12 leading-tight tracking-tight">
            <span className="block mb-4 animate-fade-in animate-delay-100 opacity-0 [animation-fill-mode:forwards]">
              <span className="text-gradient-ghana-flag">TRADE.</span>
            </span>
            <span className="block mb-4 animate-fade-in animate-delay-300 opacity-0 [animation-fill-mode:forwards]">
              <span className="text-gradient-ghana-flag">CONNECT.</span>
            </span>
            <span className="block text-5xl md:text-6xl lg:text-7xl animate-fade-in animate-delay-500 opacity-0 [animation-fill-mode:forwards]">
              <span className="text-foreground">PROSPER.</span>
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto animate-fade-in animate-delay-700 opacity-0 [animation-fill-mode:forwards] leading-relaxed font-medium">
            The future of trading is here. Join Ghana's most trusted marketplace where 
            <span className="text-gradient-retro-gold font-bold"> community meets commerce</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-fade-in animate-delay-1000 opacity-0 [animation-fill-mode:forwards]">
            <Button 
              size="lg" 
              onClick={onPostItem}
              className="robinhood-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-ghana-red retro-glow px-12 py-6 text-2xl font-black transition-all duration-300 hover:scale-105 border-0 group"
            >
              <TrendingUp className="mr-3 h-7 w-7" />
              Start Trading
              <ArrowRight className="ml-3 h-7 w-7 transition-transform group-hover:translate-x-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBrowseItems}
              className="robinhood-button border-2 border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary bg-background/90 backdrop-blur px-12 py-6 text-2xl font-black transition-all duration-300 hover:scale-105 group shadow-ghana-gold"
            >
              Explore Market
              <ArrowRight className="ml-3 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-2" />
            </Button>
          </div>
          
          {/* Robinhood-style stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in animate-delay-1200 opacity-0 [animation-fill-mode:forwards]">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground font-medium">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-secondary mb-2">₵2M+</div>
              <div className="text-sm text-muted-foreground font-medium">Monthly Volume</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-accent mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground font-medium">Uptime</div>
            </div>
          </div>
        </div>


        {/* Robinhood-style Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const colors = ['shadow-ghana-red', 'shadow-ghana-gold', 'shadow-ghana-green'];
            const gradients = ['bg-primary/5', 'bg-secondary/5', 'bg-accent/5'];
            return (
              <Card 
                key={feature.title}
                className={`robinhood-card p-8 ${gradients[index]} border-0 ${colors[index]} hover:scale-105 transition-all duration-500 group animate-fade-in relative overflow-hidden kente-pattern`}
                style={{ animationDelay: `${index * 200 + 1400}ms` }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className={`p-5 rounded-xl ${index === 0 ? 'bg-primary/20' : index === 1 ? 'bg-secondary/20' : 'bg-accent/20'} group-hover:scale-110 transition-transform retro-glow`}>
                      <IconComponent className={`h-10 w-10 ${index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent'}`} />
                    </div>
                  </div>
                  <h3 className={`text-xl font-black text-center mb-4 ${index === 0 ? 'text-primary' : index === 1 ? 'text-secondary' : 'text-accent'}`}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-center font-medium">
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