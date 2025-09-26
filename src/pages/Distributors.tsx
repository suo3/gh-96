import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Phone, Mail, Globe, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generatePageTitle, generateMetaDescription } from '@/constants/seo';

interface DistributorProfile {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  region?: string;
  city?: string;
  category: string;
  description?: string;
  business_type?: string;
  website?: string;
  contact_person?: string;
}

const DistributorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const { data: distributors, isLoading } = useQuery({
    queryKey: ['all-distributors', searchTerm, categoryFilter, regionFilter],
    queryFn: async () => {
      let query = supabase
        .from('distributor_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('verification_status', 'verified')
        .order('name');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (regionFilter !== 'all') {
        query = query.eq('region', regionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DistributorProfile[];
    }
  });

  // Get unique categories and regions for filters
  const categories = [...new Set(distributors?.map(d => d.category) || [])];
  const regions = [...new Set(distributors?.map(d => d.region).filter(Boolean) || [])];

  const getLocationString = (distributor: DistributorProfile) => {
    if (distributor.city && distributor.region) {
      return `${distributor.city}, ${distributor.region}`;
    }
    return distributor.region || distributor.city || 'Ghana';
  };

  const getDistributorAvatar = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>{generatePageTitle('Verified Distributors Directory')}</title>
        <meta name="description" content={generateMetaDescription('Browse Ghana\'s verified business distributors and suppliers across various industries')} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AppHeader 
          userLocation={null}
          onLocationDetect={() => {}}
          onPostItem={() => navigate('/post-item')}
          onLogoClick={() => navigate('/')}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Verified Business Distributors
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect directly with Ghana's top verified distributors and suppliers across various industries
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search distributors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : `${distributors?.length || 0} verified distributors found`}
            </p>
          </div>

          {/* Distributors Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : distributors && distributors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {distributors.map((distributor) => (
                <Card 
                  key={distributor.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-primary/10"
                  onClick={() => navigate(`/distributor/${distributor.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getDistributorAvatar(distributor.name)}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Verified
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {distributor.name}
                    </h3>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {distributor.category}
                      </Badge>
                      {distributor.business_type && (
                        <Badge variant="secondary" className="text-xs">
                          {distributor.business_type}
                        </Badge>
                      )}
                    </div>

                    {distributor.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {distributor.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{getLocationString(distributor)}</span>
                      </div>

                      {distributor.contact_person && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{distributor.contact_person}</span>
                        </div>
                      )}

                      {distributor.phone_number && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{distributor.phone_number}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/distributor/${distributor.id}`);
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No distributors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all categories.
              </p>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DistributorsPage;