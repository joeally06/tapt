// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
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
    }
  }
});