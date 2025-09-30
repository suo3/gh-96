import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Lock, Users, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { AppHeader } from "@/components/AppHeader";

export default function Privacy() {
  const navigate = useNavigate();
  const sections = [
    {
      title: "Information We Collect",
      icon: Eye,
      content: [
        "Account information (name, email, phone number)",
        "Profile information you choose to provide",
        "Transaction and listing data",
        "Location data (when you choose to share it)",
        "Device and usage information"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Users,
      content: [
        "To provide and improve our trading platform",
        "To facilitate secure transactions between users",
        "To prevent fraud and ensure platform safety",
        "To communicate important updates and notifications",
        "To provide customer support"
      ]
    },
    {
      title: "Information Sharing",
      icon: Shield,
      content: [
        "We never sell your personal information",
        "Information is only shared to complete transactions",
        "We may share data to comply with legal requirements",
        "Anonymous analytics may be shared with partners",
        "You control what information is visible to other users"
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        "End-to-end encryption for sensitive data",
        "Secure servers and regular security audits",
        "Two-factor authentication options",
        "Regular data backups and protection",
        "Compliance with international security standards"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy - KenteKart Ghana Trading Platform</title>
        <meta 
          name="description" 
          content="KenteKart's privacy policy outlines how we protect your personal information and ensure secure trading in Ghana's digital marketplace." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => {}}
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
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary">
              🔒 Privacy Policy
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Your Privacy</span>
              <span className="block text-foreground">Is Our Priority</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              At KenteKart, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This policy explains how we collect, use, and protect your data.
            </p>
            
            <p className="text-sm text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          {/* Privacy Sections */}
          <div className="grid gap-8 mb-16">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={section.title} className="p-8 border border-primary/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          {/* Your Rights */}
          <Card className="p-8 md:p-12 bg-primary/5 border border-primary/20 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Your Rights</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Access & Control</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Access your personal data at any time</li>
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and data</li>
                  <li>• Export your data</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Privacy Controls</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Control who sees your profile information</li>
                  <li>• Manage communication preferences</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Control location sharing</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-8 text-center border border-primary/10">
            <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about this privacy policy or how we handle your data, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:privacy@kentekart.gh" 
                className="text-primary hover:underline font-medium"
              >
                privacy@kentekart.gh
              </a>
              <span className="text-muted-foreground hidden sm:block">|</span>
              <span className="text-muted-foreground">
                KenteKart Legal Team, Accra, Ghana
              </span>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}