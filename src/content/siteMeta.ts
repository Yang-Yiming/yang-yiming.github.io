import type { HeroImage } from "../types";

export const siteMeta = {
  name: "Yang Yiming",
  role: "Student · Data Science",
  summary:
    "I'm an undergraduate student at SUSTech, interested in Computer Science and Artifical Intelegence. \
    I love oldschool street dance culture ([locking](https://en.wikipedia.org/wiki/Locking_(dance)) & [house](https://en.wikipedia.org/wiki/House_dance))\
    while my favorite music genres are [Dubstep](https://en.wikipedia.org/wiki/Dubstep) & [House](https://en.wikipedia.org/wiki/House_music).",
  location: "Shenzhen, China",
  accentLabel: "Empty accentLabel",
  links: [
    { label: "GitHub", href: "https://github.com/Yang-Yiming" },
    { label: "Email", href: "12411332@mail.sustech.edu.cn" },
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
