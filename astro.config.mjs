// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  devToolbar: {
    enabled: false  // Temporarily disable dev toolbar to work around fetch error
  },
  vite: {
    build: {
      target: 'es2022'
    },
    server: {
      hmr: {
        timeout: 120000
      },
      fs: {
        allow: ['.']
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022'
      }
    }
  }
});