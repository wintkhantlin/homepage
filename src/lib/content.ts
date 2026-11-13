import {
  getCollection,
  render,
  type CollectionEntry,
  type RenderResult,
} from "astro:content";

type RenderedEntry<Collection extends "posts" | "projects"> =
  CollectionEntry<Collection> & Pick<RenderResult, "Content" | "headings">;

export type PostEntry = RenderedEntry<"posts">;
export type ProjectEntry = RenderedEntry<"projects">;

async function renderEntries<Collection extends "posts" | "projects">(
  entries: CollectionEntry<Collection>[],
): Promise<RenderedEntry<Collection>[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const { Content, headings } = await render(entry);

      return { ...entry, Content, headings };
    }),
  );
}

export async function getSortedPosts(): Promise<PostEntry[]> {
  const entries = await getCollection("posts", ({ data }) => !data.draft);
  const posts = await renderEntries<"posts">(entries);

  return posts.sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getSortedProjects(): Promise<ProjectEntry[]> {
  const projects = await renderEntries<"projects">(await getCollection("projects"));

  return projects.sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  // Filter the raw collection first so only featured entries are rendered via MDX,
  // avoiding the cost of rendering every project when most pages only need the featured subset.
  const all = await getCollection("projects", ({ data }) => data.featured);
  const entries = await renderEntries<"projects">(all);

  return entries.sort(
    (a, b) =>
      (a.data.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.data.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
      b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}
