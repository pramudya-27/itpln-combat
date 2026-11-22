import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { combatAdminApiPlugin } from './src/lib/adminApiPlugin.mjs';

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  vite: {
    plugins: [combatAdminApiPlugin()],
  },
});
