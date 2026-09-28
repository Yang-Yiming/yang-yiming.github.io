import type { SiteLink } from "../types";

export const siteMeta = {
  name: "Yang Yiming",
  role: "Student · Data Science",
  summary:
    "I'm an undergraduate at SUSTech studying Data Science, interested in multimodal LLMs and computer science. " +
    "I love old-school street dance and bass-heavy music, " +
    "and I build tools with AI whenever I need one.",

  location: "",
  accentLabel: "When I'm thirsty, I drink.",
  links: [
    {
      label: "GitHub",
      href: "https://github.com/Yang-Yiming",
      icon: "github",
    },
    {
      label: "Email",
      href: "mailto:12411332@mail.sustech.edu.cn",
      icon: "email",
    },
  ] satisfies SiteLink[],
};
