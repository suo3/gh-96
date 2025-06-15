
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    console.log('useAuthInit: Starting auth initialization');
    initialize();
  }, [initialize]);

  // Return loading state so components can use it
  return { isLoading };
};
