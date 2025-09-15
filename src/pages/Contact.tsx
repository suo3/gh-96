import React from 'react';
import { Helmet } from 'react-helmet';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { MessageCircle, Headphones, Megaphone, Mail } from 'lucide-react';
import { useLocationDetection } from '@/hooks/useLocationDetection';

export const Contact = () => {
  const { detectedLocation, detectLocation } = useLocationDetection();

  return (
    <>
      <Helmet>
        <title>Contact Us - Support & Inquiries | KenteKart</title>
        <meta name="description" content="Get in touch with KenteKart for promotions, advertisements, support issues, and general inquiries. Our team is here to help you." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={detectLocation}
          onPostItem={() => {}}
          onLogoClick={() => window.location.href = '/'}
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question, need support, or want to explore advertising opportunities? 
                We're here to help you succeed on KenteKart.
              </p>
            </div>

            {/* Contact Types */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">General Support</h3>
                <p className="text-sm text-muted-foreground">
                  Technical issues, account help, and general questions
                </p>
              </div>

              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Promotions</h3>
                <p className="text-sm text-muted-foreground">
                  Featured listings, homepage carousel, and promotional packages
                </p>
              </div>

              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Advertisements</h3>
                <p className="text-sm text-muted-foreground">
                  Business partnerships, advertising opportunities, and sponsorships
                </p>
              </div>

              <div className="text-center p-6 bg-card rounded-lg border">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">General Inquiry</h3>
                <p className="text-sm text-muted-foreground">
                  Other questions, feedback, and business inquiries
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-lg border p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Response Time
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium text-foreground mb-2">General Support</h4>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium text-foreground mb-2">Promotions</h4>
                  <p className="text-sm text-muted-foreground">Within 12 hours</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium text-foreground mb-2">Advertisements</h4>
                  <p className="text-sm text-muted-foreground">Within 6 hours</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};