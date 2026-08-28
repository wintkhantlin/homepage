import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

import partytown from "@astrojs/partytown";

import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL || "https://wintkhantlin.com";

export default defineConfig({
  site,
  image: {
    domains: ["www.bigocheatsheet.com"],
  },

  build: {
    inlineStylesheets: "always",
  },

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
    {
      provider: fontProviders.local(),
      name: "LT Superior Serif",
      cssVariable: "--font-display",
      display: "swap",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/LTSuperiorSerif-Regular.woff2"],
            weight: "400",
            style: "normal",
          },
        ],
      },
    },
  ],

  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        if (item.url === `${site}/` || item.url === "https://wintkhantlin.com/") {
          item.priority = 1.0;
          item.changefreq = "weekly";
        } else if (item.url.includes("/project/") || item.url.includes("/post/")) {
          item.priority = 0.8;
          item.changefreq = "monthly";
        } else {
          item.priority = 0.7;
          item.changefreq = "monthly";
        }
        item.lastmod = new Date();
        return item;
      },
    }),
    icon(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],

  vite: {
    plugins: [
      tailwindcss({
        optimize: {
          minify: true,
        },
      }),
    ],
  },
});
