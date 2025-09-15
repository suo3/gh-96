import React from 'react';
import { Helmet } from 'react-helmet';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { MessageCircle, Headphones, Megaphone, Mail, DollarSign, Star, Zap } from 'lucide-react';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Contact = () => {
  const { detectedLocation, detectLocation } = useLocationDetection();

  // Fetch promotion pricing
  const { data: promotionPrices } = useQuery({
    queryKey: ['promotion-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['promotion_featured_price', 'promotion_category_price', 'promotion_carousel_price']);
      
      if (error) throw error;
      
      const prices = data.reduce((acc, item) => {
        acc[item.key] = parseFloat(item.value as string);
        return acc;
      }, {} as Record<string, number>);
      
      return {
        featured: prices.promotion_featured_price || 10,
        category: prices.promotion_category_price || 5,
        carousel: prices.promotion_carousel_price || 15,
      };
    },
  });

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

            {/* Promotion Pricing Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Promotion Packages & Pricing
              </h2>
              <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                Boost your listings' visibility with our promotion packages. All prices are in GHS (Ghanaian Cedis).
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Featured Listing */}
                <Card className="relative border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Featured Listing</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      ₵{promotionPrices?.featured || 10}
                    </div>
                    <Badge variant="outline" className="mt-2">7 Days</Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Priority placement in search results
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Featured badge on your listing
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Up to 5x more visibility
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Perfect for individual items
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Category Featured */}
                <Card className="relative border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Category Featured</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      ₵{promotionPrices?.category || 5}
                    </div>
                    <Badge variant="outline" className="mt-2">7 Days</Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Top placement in category pages
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Category-specific promotion
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Targeted audience reach
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Great for niche products
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Homepage Carousel */}
                <Card className="relative border-primary/20 hover:border-primary/40 transition-colors bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader className="text-center pb-4">
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Homepage Carousel</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      ₵{promotionPrices?.carousel || 15}
                    </div>
                    <Badge variant="outline" className="mt-2">7 Days</Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Premium homepage placement
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Maximum visibility to all users
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Up to 10x more exposure
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Best for high-value items
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Bulk Packages */}
              <div className="bg-card rounded-lg border p-8 mb-12">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                  <DollarSign className="w-6 h-6 inline mr-2" />
                  Bulk Advertising Packages
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Business Package</CardTitle>
                      <div className="text-2xl font-bold text-primary">₵45 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 5 Featured listings per month</li>
                        <li>• 10 Category featured promotions</li>
                        <li>• Priority customer support</li>
                        <li>• Monthly analytics report</li>
                        <li>• 15% savings vs individual pricing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise Package</CardTitle>
                      <div className="text-2xl font-bold text-primary">₵120 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 10 Featured listings per month</li>
                        <li>• 5 Homepage carousel spots</li>
                        <li>• 20 Category featured promotions</li>
                        <li>• Dedicated account manager</li>
                        <li>• 25% savings vs individual pricing</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-primary/5 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Ready to Promote Your Listings?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Contact us to discuss custom packages or get started with individual promotions.
                  Our team will help you choose the best strategy for your business needs.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <span>✓ No setup fees</span>
                  <span>✓ Cancel anytime</span>
                  <span>✓ 24/7 support</span>
                  <span>✓ Performance tracking</span>
                </div>
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