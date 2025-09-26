import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, ShoppingBag, Crown, Calendar, Award, ChevronDown, ChevronUp, Building2, Phone, Mail, Globe, User } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { ItemCard } from "@/components/ItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/stores/listingStore";
import { generatePageTitle, generateMetaDescription } from "@/constants/seo";
import { FeaturedStoresCarousel } from "@/components/FeaturedStoresCarousel";

interface DistributorProfile {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  region?: string;
  city?: string;
  category: string;
  description?: string;
  business_type?: string;
  website?: string;
  contact_person?: string;
  contact_person_role?: string;
  verification_status: string;
  is_active: boolean;
  products_services?: string;
  created_at: string;
}

const DistributorProfile = () => {
  const { distributorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [distributor, setDistributor] = useState<DistributorProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!distributorId) {
      setError("Invalid distributor ID");
      setIsLoading(false);
      return;
    }
    
    fetchDistributorProfile();
    fetchDistributorListings();
  }, [distributorId]);

  const fetchDistributorProfile = async () => {
    if (!distributorId) return;

    try {
      const { data, error } = await supabase
        .from('distributor_profiles')
        .select('*')
        .eq('id', distributorId)
        .eq('is_active', true)
        .eq('verification_status', 'approved')
        .single();

      if (error) throw error;
      
      if (!data) {
        setError("Distributor not found or not approved");
        return;
      }

      setDistributor(data);
    } catch (error) {
      console.error('Error fetching distributor profile:', error);
      setError("Failed to load distributor profile");
      toast({
        title: "Error",
        description: "Failed to load distributor profile.",
        variant: "destructive",
      });
    }
  };

  const fetchDistributorListings = async () => {
    if (!distributorId) return;

    try {
      // Note: We would need to link distributors to actual user accounts to get their listings
      // For now, we'll show an empty state
      setListings([]);
    } catch (error) {
      console.error('Error fetching distributor listings:', error);
      toast({
        title: "Error",
        description: "Failed to load distributor listings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDistributorAvatar = (distributor: DistributorProfile) => {
    return distributor.name.charAt(0).toUpperCase();
  };

  const getLocationString = (distributor: DistributorProfile) => {
    if (distributor.city && distributor.region) {
      return `${distributor.city}, ${distributor.region}`;
    }
    if (distributor.region) {
      return distributor.region;
    }
    if (distributor.city) {
      return distributor.city;
    }
    return "Location not specified";
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleItemClick = (item: Listing) => {
    navigate(`/item/${item.id}`);
  };

  if (isLoading) {
    return (
      <>
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading distributor profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !distributor) {
    return (
      <>
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Distributor Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || "The distributor you're looking for doesn't exist or is not approved."}
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Homepage
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{generatePageTitle(`${distributor.name} - Distributor`)}</title>
        <meta name="description" content={generateMetaDescription(`View ${distributor.name}'s profile and products on KenteKart Ghana marketplace`)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />

        {/* Featured Stores Carousel */}
        <div className="hidden sm:block">
          <FeaturedStoresCarousel />
        </div>
        
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Back Button */}
          <div className="mb-6 md:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-primary/10 p-2 md:p-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Distributor Profile Header */}
          <Card className="mb-6 md:mb-8 border border-primary/10">
            <CardHeader className="p-3 md:p-6">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {getDistributorAvatar(distributor)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-bold text-foreground">{distributor.name}</h1>
                    <Badge variant="outline" className="text-xs">
                      {distributor.category}
                    </Badge>
                  </div>
                </div>

                <Collapsible open={isDetailsExpanded} onOpenChange={setIsDetailsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center gap-2 text-sm text-muted-foreground hover:bg-primary/5 p-2"
                    >
                      {isDetailsExpanded ? "Hide Details" : "Show Details"}
                      {isDetailsExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-3">
                    <div className="pt-3 border-t border-border/50">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-1 mb-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Verified Distributor
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {distributor.business_type || 'Business'}
                        </Badge>
                      </div>

                      {/* Description */}
                      {distributor.description && (
                        <p className="text-muted-foreground mb-3 text-xs leading-relaxed text-center">{distributor.description}</p>
                      )}
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{getLocationString(distributor)}</span>
                        </div>
                        {distributor.phone_number && (
                          <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{distributor.phone_number}</span>
                          </div>
                        )}
                        {distributor.email && (
                          <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{distributor.email}</span>
                          </div>
                        )}
                        {distributor.website && (
                          <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <a href={distributor.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">Since {formatJoinDate(distributor.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getDistributorAvatar(distributor)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-foreground">{distributor.name}</h1>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Verified Distributor
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {distributor.category}
                          </Badge>
                        </div>
                      </div>
                      {distributor.business_type && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs mb-2">
                          <Building2 className="w-3 h-3 mr-1" />
                          {distributor.business_type}
                        </Badge>
                      )}
                      {distributor.contact_person && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{distributor.contact_person}</span>
                          {distributor.contact_person_role && (
                            <span className="text-xs">({distributor.contact_person_role})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {distributor.description && (
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{distributor.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{getLocationString(distributor)}</span>
                    </div>
                    {distributor.phone_number && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{distributor.phone_number}</span>
                      </div>
                    )}
                    {distributor.email && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{distributor.email}</span>
                      </div>
                    )}
                    {distributor.website && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={distributor.website} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">Since {formatJoinDate(distributor.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information Card */}
          <Card className="mb-6 md:mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {distributor.phone_number && (
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <a href={`tel:${distributor.phone_number}`}>
                    <Phone className="w-4 h-4" />
                    Call {distributor.phone_number}
                  </a>
                </Button>
              )}
              {distributor.email && (
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <a href={`mailto:${distributor.email}`}>
                    <Mail className="w-4 h-4" />
                    Email Us
                  </a>
                </Button>
              )}
              {distributor.website && (
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <a href={distributor.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                </Button>
              )}
              {distributor.address && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{distributor.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products/Listings */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Products & Services
              </h2>
            </div>

            {distributor.products_services ? (
              <Card className="p-6">
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {distributor.products_services}
                </div>
              </Card>
            ) : (
              <Card className="p-8 md:p-12 text-center">
                <Building2 className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  {distributor.name} will be listing their products and services here soon. 
                  Contact them directly for current availability and pricing.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default DistributorProfile;