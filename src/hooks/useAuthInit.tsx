
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuthInit = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
};
