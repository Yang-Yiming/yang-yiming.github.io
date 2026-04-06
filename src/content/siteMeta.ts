import type { HeroImage } from "../types";

export const siteMeta = {
  name: "Yang Yiming",
  role: "Student · Data Science",
  summary:
    "I'm an undergraduate student at SUSTech, studying Computer Science and Artificial Intelligence. Interested in Multimodal LLMs." +
    "I love old-school street dance and bass-heavy music. " +
    "Building tools with AI whenever I have a need",

  location: "Shenzhen, China",
  accentLabel: "Empty accentLabel",
  links: [
    { label: "GitHub", href: "https://github.com/Yang-Yiming" },
    { label: "Email", href: "mailto:12411332@mail.sustech.edu.cn" },
  ],
  heroImages: [
    {
      src: "/assets/sand-homepage.webp",
      alt: "sanddraw",
      caption: "Random Sand Drawing",
    },
    {
      src: "/assets/hero-02.jpg",
      alt: "Hero image two.",
      caption: "Another visual fragment from research or life.",
    },
    {
      src: "/assets/hero-03.jpg",
      alt: "Hero image three.",
      caption: "A third slot for atmosphere or documentation.",
    },
  ] satisfies HeroImage[],
};
