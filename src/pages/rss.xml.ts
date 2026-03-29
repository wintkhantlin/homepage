import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getSortedPosts } from "../lib/content";
import { siteConfig } from "../lib/seo";

export const GET: APIRoute = async ({ site }) => {
  const posts = await getSortedPosts();

  return rss({
    title: `${siteConfig.siteName} RSS Feed`,
    description: siteConfig.defaultDescription,
    site: site ?? "http://localhost:4321",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.summary ?? "",
      pubDate: post.data.publishedDate,
      link: `/post/${post.id}/`,
      categories: post.data.categories,
    })),
    customData: `<language>en-us</language>`,
  });
};

