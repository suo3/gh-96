import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kentekart.app',
  appName: 'KenteKart Ghana',
  webDir: 'dist',
  server: {
    url: 'https://3b4b6ddc-1100-49e9-8f64-4efb2ab228ea.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
