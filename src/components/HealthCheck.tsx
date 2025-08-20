import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const HealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Simple health check - try to fetch platform settings
        const { error } = await supabase
          .from('platform_settings')
          .select('key')
          .limit(1);
        
        if (error) {
          console.error('Health check failed:', error);
          setStatus('error');
        } else {
          setStatus('healthy');
        }
      } catch (error) {
        console.error('Health check error:', error);
        setStatus('error');
      }
    };

    checkHealth();
  }, []);

  // Only render in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === 'healthy' ? 'bg-green-100 text-green-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        DB: {status}
      </div>
    </div>
  );
};