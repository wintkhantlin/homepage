export const siteConfig = {
  name: "Wint Khant Lin",
  givenName: "Wint Khant",
  familyName: "Lin",
  siteName: "Wint Khant Lin",
  handle: "Happer",
  author: "Wint Khant Lin",
  role: "Software engineer",
  locale: "en_US",
  defaultTitle: "Backend Software Engineer Portfolio | Wint Khant Lin",
  defaultDescription:
    "Explore Wint Khant Lin's software engineer portfolio, backend projects, systems thinking, web experiments, and programming notes from Myanmar.",
  defaultImage: "/favicon.png",
  defaultKeywords: [
    "Wint Khant Lin",
    "Happer",
    "software engineer portfolio",
    "backend engineering",
    "systems programming",
    "web development",
    "programming blog",
    "software projects",
    "Myanmar developer",
  ],
  social: {
    github: "https://github.com/wintkhantlin",
    linkedin: "https://www.linkedin.com/in/wintkhantlin/",
    email: "mailto:hello@wintkhantlin.com",
  },
};

export function dedupeKeywords(values: Array<string | undefined | null>) {
  return [...new Set(values.filter(Boolean).map((value) => value!.trim()))];
}

function normalizeInternalPath(path: string) {
  if (!path.startsWith("/")) return path;

  const url = new URL(path, "https://portfolio.invalid");
  const finalSegment = url.pathname.split("/").pop() ?? "";
  const isFile = finalSegment.includes(".");

  if (url.pathname !== "/" && !url.pathname.endsWith("/") && !isFile) {
    url.pathname += "/";
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function absoluteUrl(path: string, site?: URL) {
  const normalizedPath = normalizeInternalPath(path);
  return site ? new URL(normalizedPath, site).toString() : normalizedPath;
}

export function createPersonSchema(site?: URL, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person", site),
    name: siteConfig.name,
    givenName: siteConfig.givenName,
    familyName: siteConfig.familyName,
    alternateName: siteConfig.handle,
    url: absoluteUrl("/", site),
    description: `${siteConfig.role} from Myanmar focused on backend systems, web products, and software architecture.`,
    ...(image ? { image: absoluteUrl(image, site) } : {}),
    jobTitle: siteConfig.role,
    knowsAbout: [
      "Backend engineering",
      "Systems programming",
      "Web development",
      "Software architecture",
    ],
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  };
}

export function createWebsiteSchema(site?: URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.siteName,
    url: absoluteUrl("/", site),
    description: siteConfig.defaultDescription,
    inLanguage: "en",
    author: {
      "@type": "Person",
      "@id": absoluteUrl("/#person", site),
      name: siteConfig.author,
    },
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  site?: URL,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}
