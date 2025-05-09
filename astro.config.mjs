import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sharp from '@astrojs/sharp';

export default defineConfig({
  integrations: [
    tailwind(),
    sharp()
  ]
});