import { getImage } from "astro:assets";

// Every image dropped into src/images/ghost/ can appear on the ghost's face.
const modules = import.meta.glob<{ default: ImageMetadata }>("../images/ghost/*.{png,jpg,jpeg,webp,avif}", { eager: true });

export const getGhostPhotos = () =>
  Promise.all(Object.values(modules).map(async ({ default: src }) => (await getImage({ src, width: 170, format: "webp" })).src));
