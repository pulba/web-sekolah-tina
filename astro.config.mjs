// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import alpinejs from "@astrojs/alpinejs";

import sitemap from "@astrojs/sitemap";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: 'https://masmifhda.sch.id/',
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [alpinejs(), sitemap(), robotsTxt({
    sitemap: [
      'https://masmifhda.sch.id/sitemap.xml'
    ],
  })],
});