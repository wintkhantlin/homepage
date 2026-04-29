import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

export async function getSortedPosts() {
  return (await getCollection("content")).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getProjectsWithPreviews() {
  const rawProjects = (await getCollection("projects")).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );

  return Promise.all(
    rawProjects.map(async (project) => {
      const [preview, blurPreview] = await Promise.all([
        getImage({
          src: project.data.img,
          width: 1024,
          format: "webp",
        }),
        getImage({
          src: project.data.img,
          width: 24,
          format: "webp",
          quality: 10
        }),
      ]);

      return {
        ...project,
        previewSrc: preview.src,
        blurPreviewSrc: blurPreview.src,
      };
    }),
  );
}
