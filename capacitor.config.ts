import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kentekart.app',
  appName: 'KenteKart Ghana',
  webDir: 'dist',
  server: {
    url: 'https://kentekart.com',
    cleartext: true
  }
};

export default config;
