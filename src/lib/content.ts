import { readFile } from "node:fs/promises";
import type { ImageMetadata, MarkdownHeading } from "astro";

type ContentComponent = (...args: any[]) => any;

type PostFrontmatter = {
  title: string;
  seoTitle?: string;
  summary?: string;
  description?: string;
  seoDescription?: string;
  categories: string[];
  publishedDate: string | Date;
  lang?: "en" | "my";
};

type ProjectFrontmatter = {
  name: string;
  type?: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  source: string;
  publishedDate: string | Date;
  img: string;
  technologies?: string[];
  featured: boolean;
  featuredOrder?: number;
  maturity: "built" | "prototype" | "work-in-progress";
  context: "open-source" | "personal" | "hackathon";
  role: string;
  proofPoints: [string, string];
  color: string;
  caseStudy?: {
    status: string;
    challenge: string;
    approach: string;
    architecture: string[];
    highlights: string[];
    diagram: string;
  };
};

type MarkdownModule<TFrontmatter> = {
  Content: ContentComponent;
  file?: string;
  frontmatter: TFrontmatter;
  getHeadings: () => MarkdownHeading[];
};

type ImportedImageModule = {
  default: ImageMetadata;
};

export type PostEntry = {
  id: string;
  body?: string;
  Content: ContentComponent;
  headings: MarkdownHeading[];
  data: Omit<PostFrontmatter, "publishedDate"> & {
    publishedDate: Date;
  };
};

export type ProjectEntry = {
  id: string;
  body?: string;
  Content: ContentComponent;
  data: Omit<ProjectFrontmatter, "publishedDate" | "img"> & {
    publishedDate: Date;
    img: ImageMetadata;
  };
};

const postModules = import.meta.glob<MarkdownModule<PostFrontmatter>>(
  "../content/posts/*.mdx",
  { eager: true },
);

const projectModules = import.meta.glob<MarkdownModule<ProjectFrontmatter>>(
  "../content/projects/*.{md,mdx}",
  { eager: true },
);

const projectImages = import.meta.glob<ImportedImageModule>("../assets/img/*", {
  eager: true,
});

function getIdFromPath(path: string) {
  return path.split("/").pop()?.replace(/\.(md|mdx)$/, "") ?? path;
}

async function readBody(file?: string) {
  if (!file) return undefined;

  const source = await readFile(file, "utf-8");
  return source.replace(/^---[\s\S]*?\n---\s*/u, "").trim();
}

async function mapPosts() {
  return Promise.all(
    Object.entries(postModules).map(async ([path, mod]) => ({
      id: getIdFromPath(path),
      body: await readBody(mod.file),
      Content: mod.Content,
      headings: mod.getHeadings(),
      data: {
        ...mod.frontmatter,
        publishedDate: new Date(mod.frontmatter.publishedDate),
      },
    })),
  );
}

async function mapProjects() {
  return Promise.all(
    Object.entries(projectModules).map(async ([path, mod]) => {
      const imageName = String(mod.frontmatter.img).split("/").pop();
      const imagePath = Object.keys(projectImages).find((key) => key.endsWith(`/${imageName}`));
      if (!imagePath) {
        throw new Error(`Unable to resolve project image "${mod.frontmatter.img}" for ${path}`);
      }
      const image = projectImages[imagePath].default;

      return {
        id: getIdFromPath(path),
        body: await readBody(mod.file),
        Content: mod.Content,
        data: {
          ...mod.frontmatter,
          img: image,
          publishedDate: new Date(mod.frontmatter.publishedDate),
        },
      };
    }),
  );
}

export async function getSortedPosts() {
  return (await mapPosts()).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getSortedProjects() {
  return (await mapProjects()).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getFeaturedProjects() {
  return (await mapProjects())
    .filter((project) => project.data.featured)
    .sort(
      (a, b) =>
        (a.data.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.data.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
        b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
    );
}
