import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GhanaRegion {
  id: string;
  name: string;
  cities: string[];
}

export const useGhanaLocation = () => {
  const [regions, setRegions] = useState<GhanaRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ghana_regions')
        .select('*')
        .order('name');

      if (error) throw error;

      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching Ghana regions:', err);
      setError('Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  const getCitiesForRegion = (regionName: string): string[] => {
    const region = regions.find(r => r.name === regionName);
    return region?.cities || [];
  };

  const formatLocationString = (city: string, region: string): string => {
    return `${city}, ${region}`;
  };

  return {
    regions,
    loading,
    error,
    getCitiesForRegion,
    formatLocationString,
    refetch: fetchRegions
  };
};