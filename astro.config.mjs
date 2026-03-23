// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import icon from "astro-icon";

import partytown from "@astrojs/partytown";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      weights: ["400", "500", "600", "700", "800"],
      cssVariable: "--font-heading",
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      weights: ["400", "500", "700"],
      cssVariable: "--font-body",
      display: "swap",
    },
  ],

  integrations: [
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss({
      optimize: {
        minify: true
      }
    })],
  },
});