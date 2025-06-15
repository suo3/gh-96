
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const { initialize, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    console.log('useAuthInit: Starting auth initialization');
    initialize();
  }, [initialize]);

  // Return both loading and initialized state
  return { isLoading, isInitialized };
};
