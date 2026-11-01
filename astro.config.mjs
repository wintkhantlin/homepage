import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, fontProviders } from "astro/config";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

import partytown from "@astrojs/partytown";

import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL || "https://wintkhantlin.com";

// Map each URL path to the date its content last changed, read from frontmatter.
function collectLastmod() {
  const map = new Map();
  const readDates = (dir, prefix, keys) => {
    for (const file of readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const source = readFileSync(join(dir, file), "utf8");
      const dates = keys
        .map((key) => source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1])
        .map((value) => (value ? new Date(value.replace(/["']/g, "").trim()) : undefined))
        .filter((date) => date && !Number.isNaN(date.valueOf()));
      if (dates.length) map.set(`${prefix}/${file.replace(/\.mdx?$/, "")}`, dates[0]);
    }
  };

  readDates("./src/content/posts", "/post", ["updatedDate", "publishedDate"]);
  readDates("./src/content/projects", "/project", ["publishedDate"]);

  const newest = (prefix) =>
    [...map].filter(([path]) => path.startsWith(prefix)).map(([, date]) => date).sort((a, b) => b - a)[0];
  if (newest("/post")) map.set("/writing", newest("/post"));
  if (newest("/project")) map.set("/projects", newest("/project"));

  return map;
}

const lastmodByPath = collectLastmod();

export default defineConfig({
  site,
  image: {
    domains: ["www.bigocheatsheet.com"],
  },

  // Pages load on hover or tap, so navigation lands inside the Doherty threshold (~400ms).
  prefetch: {
    defaultStrategy: "hover",
  },

  // Inline the CSS so first paint needs no stylesheet round trip. The external file was
  // a render-blocking request on the critical path; the cost is a larger HTML per page.
  build: {
    inlineStylesheets: "always",
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      weights: ["400", "500", "600", "700", "800"],
      styles: ["normal"],
      cssVariable: "--font-heading",
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      weights: ["400", "500", "700"],
      styles: ["normal"],
      cssVariable: "--font-body",
      display: "swap",
    },
  ],

  integrations: [
    expressiveCode({
      themes: ["github-dark-high-contrast", "github-light-high-contrast"],
      useDarkModeMediaQuery: false,
    }),
    mdx(),
    sitemap({
      // Google ignores priority/changefreq and distrusts a lastmod that changes on every build,
      // so only emit lastmod when it comes from content dates.
      serialize(item) {
        const { pathname } = new URL(item.url);
        const lastmod = lastmodByPath.get(pathname.replace(/\/$/, ""));
        if (!lastmod) return item;
        item.lastmod = lastmod.toISOString();
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
