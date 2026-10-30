import "server-only";
import type { Route } from "next";
import {
  componentSlugs,
  getComponent,
  pin,
  primitiveSlugs,
  tokenList,
} from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";

/** The release a package is pinned at, as the strip and the hero print it. */
const versionOf = (name: string) => pin.packages.find((p) => p.name === name)?.version ?? "";

/** A world's part on the bench: its balloon, the system entry it is, and what lies under its paint. */
export type BomRow = { no: string; part: string; entry: string; under: string; keys: string };

/**
 * The bench's specimen, part by part, in the order it is drawn (Specimen.tsx): each
 * styled component, and the primitive its behavior comes from, or none where it is
 * markup only. Read from the reference, so the drawing cannot claim more than the build.
 */
const PARTS = [
  ["01", "Badge", "badge"],
  ["02", "Heading", "heading"],
  ["03", "Text", "text"],
  ["04", "Segmented", "segmented-control"],
  ["05", "Progress", "progress"],
  ["06", "Kbd", "kbd"],
  ["07", "Button", "button"],
] as const;

/** A key as the parts list prints it: the arrows as arrows. */
const ARROWS: Record<string, string> = {
  ArrowRight: "→",
  ArrowLeft: "←",
  ArrowDown: "↓",
  ArrowUp: "↑",
};

export const BOM: BomRow[] = PARTS.map(([no, part, slug]) => {
  const primitive = getComponent(slug)?.primitive;
  const keys = primitive
    ? [...new Set(primitive.keys.map((k) => k.key))].filter((k) => k !== "Tab")
    : [];
  return {
    no,
    part,
    entry: `components/${slug}`,
    under: primitive?.name ?? "markup only",
    keys: primitive ? keys.map((k) => ARROWS[k] ?? k).join(" ") : "no behavior",
  };
});
/** A motion curve on the scope: the roles that share it, its easing, and its duration. */
export type Curve = { id: string; roles: string[]; easing: string; duration: string };

/**
 * The motion tokens as curves: the roles grouped by the easing they share, each
 * timed by the longest of them. Five roles, three curves, in the site's own values.
 */
/** A token's value in the site's own theme: the one set of values the docs show. */
const valueOf = (name: string) =>
  tokenList.find((t) => t.name === name)?.values[SITE_THEME]?.light ?? "";

export const CURVES: Curve[] = (() => {
  const roles = [
    ...new Set(
      tokenList.filter((t) => t.name.startsWith("motion.")).map((t) => t.name.split(".")[1] ?? ""),
    ),
  ];
  const curves = new Map<string, Curve>();
  for (const role of roles) {
    const easing = valueOf(`motion.${role}.easing`);
    const duration = valueOf(`motion.${role}.duration`);
    const curve = curves.get(easing);
    if (curve) {
      curve.roles.push(role);
      if (parseFloat(duration) > parseFloat(curve.duration)) curve.duration = duration;
    } else curves.set(easing, { id: role, roles: [role], easing, duration });
  }
  return [...curves.values()];
})();

export const MOTION_ROLES = CURVES.reduce((n, c) => n + c.roles.length, 0);

export type WorldId = "system" | "primitives" | "motion";

/** One world of the front door: its rail tab, its copy, and its three readings. */
export type WorldData = {
  id: WorldId;
  no: string;
  name: string;
  package: string;
  status: string;
  href: Route;
  cta: string;
  title: string;
  lede: string;
  specs: { value: string; term: string }[];
};

const system = versionOf("@scnx/system");
const core = versionOf("@scnx/core-ui");

/**
 * The three worlds of Scnehaux UI, in the order a part is made (the owner, 2026-10-30):
 * the headless primitives, the design system that paints them, and motion, whose package
 * is not yet built, so its world says so and leads to a page that says so.
 */
export const WORLDS: WorldData[] = [
  {
    id: "primitives",
    no: "01",
    name: "Primitives",
    package: "@scnx/core-ui",
    status: core,
    href: "/primitives",
    cta: "Enter the primitives",
    title: "Behavior, unpainted.",
    lede: "Every part starts here: semantic HTML, keyboard, focus and ARIA, with no paint on it, ready for styles of your own.",
    specs: [
      { value: String(primitiveSlugs.length), term: "Primitives" },
      { value: "0", term: "Dependencies" },
      { value: "0", term: "Styles" },
    ],
  },
  {
    id: "system",
    no: "02",
    name: "Design system",
    package: "@scnx/system",
    status: system,
    href: "/system",
    cta: "Enter the design system",
    title: "Finished parts.",
    lede: "The same parts, painted: accessible React components in static CSS, bound to tokens and themed by scope. Pick one up and ship it.",
    specs: [
      { value: String(componentSlugs.length), term: "Components" },
      { value: String(tokenList.length), term: "Tokens" },
      { value: "0", term: "Runtime CSS" },
    ],
  },
  {
    id: "motion",
    no: "03",
    name: "Motion",
    package: "In fabrication",
    status: "",
    href: "/motion",
    cta: "See what is coming",
    title: "Movement, measured.",
    lede: "A motion library is in fabrication: enter, exit and feedback for the components and the primitives alike, timed by the motion roles the tokens already ship.",
    specs: [
      { value: String(MOTION_ROLES), term: "Motion roles" },
      { value: String(CURVES.length), term: "Curves" },
      { value: "Soon", term: "Package" },
    ],
  },
];
