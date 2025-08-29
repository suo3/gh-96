import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copyright, Shield, AlertTriangle, Scale } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Trademark() {
  const trademarks = [
    {
      name: "SwapBoard®",
      description: "Our primary trademark covering our trading platform and services",
      category: "Platform Name"
    },
    {
      name: "SwapBoard Logo",
      description: "Our distinctive logo and visual brand elements",
      category: "Visual Identity"
    },
    {
      name: "Trade Smart, Live Local",
      description: "Our registered slogan and marketing tagline",
      category: "Slogan"
    }
  ];

  const guidelines = [
    {
      icon: Shield,
      title: "Authorized Use",
      description: "Our trademarks may only be used with explicit written permission from SwapBoard Ghana Limited."
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Use",
      description: "Using our trademarks to imply endorsement, affiliation, or authorization without permission is strictly prohibited."
    },
    {
      icon: Scale,
      title: "Legal Protection",
      description: "We actively monitor and protect our intellectual property rights under Ghanaian and international law."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Trademark Information - SwapBoard Ghana Trading Platform</title>
        <meta 
          name="description" 
          content="Information about SwapBoard's trademarks, intellectual property rights, and usage guidelines for our brand assets." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary">
              ™ Trademark Information
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Protecting Our</span>
              <span className="block text-foreground">Brand Heritage</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              SwapBoard and related marks are trademarks of SwapBoard Ghana Limited. 
              This page outlines our intellectual property rights and usage guidelines.
            </p>
          </div>

          {/* Registered Trademarks */}
          <Card className="p-8 md:p-12 mb-16 border border-primary/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-primary/10">
                <Copyright className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Our Registered Trademarks</h2>
            </div>
            
            <div className="grid gap-6">
              {trademarks.map((trademark, index) => (
                <div key={trademark.name} className="border border-primary/10 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{trademark.name}</h3>
                      <p className="text-muted-foreground">{trademark.description}</p>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {trademark.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Usage Guidelines */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Usage Guidelines</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {guidelines.map((guideline, index) => {
                const IconComponent = guideline.icon;
                return (
                  <Card 
                    key={guideline.title}
                    className="p-8 text-center hover:shadow-lg transition-all duration-300 border border-primary/10"
                  >
                    <div className="p-4 rounded-2xl bg-primary/10 mx-auto mb-6 w-fit">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{guideline.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {guideline.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Legal Notice */}
          <Card className="p-8 md:p-12 bg-primary/5 border border-primary/20 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">Legal Notice</h2>
            <div className="space-y-6 text-muted-foreground">
              <p className="leading-relaxed">
                All trademarks, service marks, trade names, logos, and other intellectual property 
                displayed on the SwapBoard platform are the property of SwapBoard Ghana Limited or 
                their respective owners. Nothing on this platform should be construed as granting 
                any license or right to use any trademark without the written permission of SwapBoard 
                Ghana Limited or the relevant trademark owner.
              </p>
              
              <p className="leading-relaxed">
                SwapBoard® is a registered trademark of SwapBoard Ghana Limited in Ghana and other 
                jurisdictions. Unauthorized use of our trademarks is strictly prohibited and may 
                result in legal action.
              </p>
              
              <p className="leading-relaxed">
                If you believe that your trademark rights are being infringed upon through the 
                SwapBoard platform, please contact our legal team immediately with detailed 
                information about the alleged infringement.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-8 text-center border border-primary/10">
            <h2 className="text-2xl font-bold mb-4">Trademark Inquiries</h2>
            <p className="text-muted-foreground mb-6">
              For questions about trademark usage, licensing, or to report trademark infringement, 
              please contact our legal department.
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:legal@swapboard.gh" 
                  className="text-primary hover:underline font-medium"
                >
                  legal@swapboard.gh
                </a>
                <span className="text-muted-foreground hidden sm:block">|</span>
                <span className="text-muted-foreground">
                  Legal Department, SwapBoard Ghana Limited
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Registered Office: Accra, Greater Accra Region, Ghana</p>
                <p>Company Registration: [Registration Number]</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}