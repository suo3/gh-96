import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export const VerifiedDistributorsSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: distributors, isLoading } = useQuery({
    queryKey: ['verified-distributors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('distributor_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as DistributorProfile[];
    }
  });

  const getLocationString = (distributor: DistributorProfile) => {
    if (distributor.city && distributor.region) {
      return `${distributor.city}, ${distributor.region}`;
    }
    return distributor.region || distributor.city || 'Ghana';
  };

  const getDistributorAvatar = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Verified Distributors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      </div>
    );
  }

  if (!distributors || distributors.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Verified Business Distributors
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect directly with Ghana's top verified distributors and suppliers across various industries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              <Badge variant="outline" className="mb-3 text-xs">
                {distributor.category}
              </Badge>

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

      {distributors.length >= 8 && (
        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/distributors')}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            View All Distributors
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};