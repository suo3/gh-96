import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, Heart, Shield, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { AppHeader } from "@/components/AppHeader";

export default function About() {
  const navigate = useNavigate();
  const values = [
    {
      icon: Users,
      title: "Community First",
      description: "We believe in empowering Ghanaian communities through safe, local trading connections."
    },
    {
      icon: Target,
      title: "Local Focus",
      description: "Built specifically for Ghana's unique market needs and mobile money ecosystem."
    },
    {
      icon: Heart,
      title: "Trust & Safety",
      description: "Every feature is designed with user safety and trust as our top priority."
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "Advanced security measures protect every transaction and user interaction."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - KenteKart Ghana's Premier Trading Platform</title>
        <meta 
          name="description" 
          content="Learn about KenteKart's mission to empower Ghanaian communities through safe, local trading. Discover our story, values, and commitment to Ghana's digital marketplace." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post')}
          onLogoClick={() => navigate('/')}
        />
        <div className="container mx-auto px-4 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary">
              🇬🇭 About KenteKart
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
              Empowering Ghana's
              <span className="block text-foreground">Digital Marketplace</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              KenteKart was born from a simple vision: to create a trusted, local trading platform 
              that connects Ghanaians across all 16 regions, making it easy to buy, sell, and trade 
              safely within our communities.
            </p>
          </div>

          {/* Our Story */}
          <Card className="p-8 md:p-12 mb-16 bg-card border border-primary/10">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Founded in 2024, KenteKart emerged from the need for a truly Ghanaian trading platform. 
                  We recognized that existing platforms didn't address the unique needs of our market - 
                  from mobile money integration to regional connectivity.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we proudly serve over 50,000 active traders across Ghana, facilitating hundreds 
                  of thousands of safe transactions and building bridges between communities from Accra to Tamale.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-4 w-fit">
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary">50K+</div>
                    <div className="text-sm text-muted-foreground">Active Traders</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary">200K+</div>
                    <div className="text-sm text-muted-foreground">Items Traded</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary">16</div>
                    <div className="text-sm text-muted-foreground">Regions Covered</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-primary">4.9★</div>
                    <div className="text-sm text-muted-foreground">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Our Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card 
                    key={value.title}
                    className="p-6 text-center hover:shadow-lg transition-all duration-300 border border-primary/10"
                  >
                    <div className="p-4 rounded-2xl bg-primary/10 mx-auto mb-4 w-fit">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mission Statement */}
          <Card className="p-8 md:p-12 text-center bg-primary/5 border border-primary/20">
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              To democratize commerce in Ghana by providing a secure, accessible, and community-driven 
              platform that empowers every Ghanaian to participate in the digital economy, regardless 
              of their location or technical expertise.
            </p>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}