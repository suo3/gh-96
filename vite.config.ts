/// <reference path="./lovable-tagger.d.ts" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Make lovable-tagger optional and only load it in development if installed
export default defineConfig(async ({ mode }) => {
  let taggerPlugin: any = null;
  if (mode === 'development') {
    try {
      const mod = await import('lovable-tagger');
      taggerPlugin = mod.componentTagger?.();
    } catch {
      // If not installed, ignore silently
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        clientPort: 8080,
      }
    },
    plugins: [
      react(),
      taggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __WS_TOKEN__: JSON.stringify(process.env.WS_TOKEN || ''),
    }
  };
});
