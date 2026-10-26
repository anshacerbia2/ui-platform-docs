import type { Route } from "next";

export const SECTIONS: {
  href: Route;
  label: string;
  mark: "primitive" | "component" | "token" | "release";
  description: string;
  package: string;
}[] = [
  {
    href: "/primitives",
    label: "Primitives",
    mark: "primitive",
    description: "Headless, accessible behavior with semantic HTML and no styles.",
    package: "@scnx/core-ui",
  },
  {
    href: "/components",
    label: "Components",
    mark: "component",
    description: "Primitives dressed in static CSS, scoped themes, and token-bound states.",
    package: "@scnx/system",
  },
  {
    href: "/tokens",
    label: "Tokens",
    mark: "token",
    description: "OKLCH color, type, space, effect, and motion, as CSS, JSON, and Sass.",
    package: "css · json · scss",
  },
  {
    href: "/releases",
    label: "Releases",
    mark: "release",
    description: "Stability of every entry, the pinned build, and its signed provenance.",
    package: "evidence",
  },
];

/** The nav strip's areas: the docs home, then the four contracts. */
export const NAV_LINKS: { href: Route; label: string }[] = [
  { href: "/get-started", label: "Get started" },
  ...SECTIONS.map(({ href, label }) => ({ href, label })),
];

export const REPOSITORY_URL = "https://github.com/anshacerbia2/ui-platform";
export const ARCHITECTURE_URL = "https://github.com/anshacerbia2/scnehaux-architecture";
