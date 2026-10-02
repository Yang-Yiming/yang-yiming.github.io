// Music taste timeline for the Electronic Music entry.
//
// Tuning: each genre's `amount` is how much of my listening it took up in each era,
// in ERAS order. Band height = amount, so the stack's total height is how much music
// I listened to overall. Numbers are relative: the tallest era always fills the chart,
// so only the ratios matter. 0 means "barely", not literally never; decimals are fine.
//
//                kid  primary  2021  2024  2025  2026  now
// pop             4      1       0     0     1     1   1.5
// progfb          0      6       2     0     0     0     0
// melodic         0      0       7     5     3     0     0
// brostep         0      0       0     5     6     2     2
// house           0      0       0     0     3     6     6
// garage          0      0       0     0     0     6     6
// kpop            0      0       0     0     0     0     3

export interface Genre {
  id: string;
  name: string;
  // light-dark() pair, so bands follow the theme toggle.
  color: string;
  amount: number[];
}

export interface Era {
  id: string;
  period: string;
  title: string;
  story: string;
  favorites: string[];
  feel: string;
  link?: { href: string; label: string };
  // Reserved for a lazy-loaded embed later.
  gatewayTrack?: { title: string; artist: string; url: string };
}

export const ERAS: Era[] = [
  {
    id: "kid",
    period: "Kid",
    title: "Western pop",
    story: "Where it all started: whatever was on the radio and in the car, sung along to without knowing a single genre name.",
    favorites: [],
    feel: "Hooks you can hum after one listen.",
  },
  {
    id: "primary",
    period: "Primary school",
    title: "Progressive house & future bass",
    story: "My first obsession with electronic sounds. Big builds, bright supersaws, and drops that felt like the sky opening up.",
    favorites: [],
    feel: "Pure euphoria, every single drop.",
  },
  {
    id: "2021",
    period: "2021",
    title: "Melodic dubstep",
    story: "While playing Terraria, a random track in my earphones turned out to be melodic dubstep. I fell in love with it on the spot.",
    favorites: ["Au5", "Seven Lions", "Chime"],
    feel: "Heavy bass that somehow feels emotional instead of aggressive.",
  },
  {
    id: "2024",
    period: "2024",
    title: "Brostep",
    story: "I started to hear the beauty in pure brostep: the sound design, the chaos, the way a growl can be crafted like an instrument. That summer I also picked up a DDJ-FLX4.",
    favorites: ["Skrillex", "Virtual Riot"],
    feel: "Controlled chaos, and every sound is designed.",
    link: { href: "#dj", label: "Started DJing" },
  },
  {
    id: "2025",
    period: "2025",
    title: "House, through dancing",
    story: "Joining house dance changed how I listen. Half my week was house in the practice room, the other half was dubstep at full volume.",
    favorites: [],
    feel: "A groove you feel in your feet before your ears.",
    link: { href: "/life/street-dance/", label: "Street dance" },
  },
  {
    id: "2026",
    period: "2026",
    title: "House & garage",
    story: "Suddenly I understood the beauty of Quest for Fire, and fell deep into house and UK garage, following the bass back to where it came from.",
    favorites: ["Skrillex", "Fred again.."],
    feel: "Swung drums, warm subs, and space to breathe.",
  },
  {
    id: "now",
    period: "Now",
    title: "K-pop, by way of the club",
    story: "Lately I've been listening to some K-pop, because a lot of it is built on house and garage too.",
    favorites: [],
    feel: "Familiar grooves, new voices.",
  },
];

export const GENRES: Genre[] = [
  { id: "pop", name: "Pop", color: "light-dark(#c2588f, #e48ab8)", amount: [4, 1, 0, 0, 1, 1, 1.5] },
  { id: "progfb", name: "Prog House / Future Bass", color: "light-dark(#8a5cc8, #b394ea)", amount: [0, 6, 2, 0, 0, 0, 0] },
  { id: "melodic", name: "Melodic Dubstep", color: "light-dark(#3f7fc4, #7fb2ea)", amount: [0, 0, 7, 5, 3, 0, 0] },
  { id: "brostep", name: "Brostep", color: "light-dark(#2f9a8a, #5fd0bd)", amount: [0, 0, 0, 5, 6, 2, 2] },
  { id: "house", name: "House", color: "light-dark(#c98a1f, #f0b44e)", amount: [0, 0, 0, 0, 3, 6, 6] },
  { id: "garage", name: "Garage", color: "light-dark(#c25a35, #ec8a63)", amount: [0, 0, 0, 0, 0, 6, 6] },
  { id: "kpop", name: "K-pop", color: "light-dark(#5a8f2f, #9acb6a)", amount: [0, 0, 0, 0, 0, 0, 3] },
];
