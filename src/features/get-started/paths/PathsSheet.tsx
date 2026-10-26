import type { Route } from "next";
import Link from "next/link";
import { Cells } from "@/components/docs/Cells";
import { ArrowRight } from "@/components/docs/Icons";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Subtitle } from "@/components/docs/Type";
import { DarkRoot } from "@/components/system/Theme";
import { counts } from "../data";
import styles from "./Paths.module.scss";

type Path = {
  title: string;
  package: string;
  text: string;
  figure: string;
  unit: string;
  links: { label: string; href: Route }[];
  audience: string;
};

const PATHS: Path[] = [
  {
    title: "Primitives",
    package: "@scnx/core-ui",
    text: "Headless behavior. Semantic HTML, keyboard, focus and ARIA, with zero styling.",
    figure: String(counts.primitives),
    unit: "primitives with a page",
    links: [
      { label: "Every primitive", href: "/primitives" },
      { label: "Button base", href: "/primitives/button-base" as Route },
      { label: "Tabs base", href: "/primitives/tabs-base" as Route },
    ],
    audience: "For teams with their own look",
  },
  {
    title: "Components",
    package: "@scnx/system",
    text: "Primitives dressed in Scnehaux. Static CSS, scoped themes, token-bound states.",
    figure: String(counts.components),
    unit: "styled components",
    links: [
      { label: "Every component", href: "/components" },
      { label: "Button", href: "/components/button" as Route },
      { label: "Text field", href: "/components/text-field" as Route },
    ],
    audience: "For product teams shipping fast",
  },
  {
    title: "Tokens",
    package: "--ds-*",
    text: "One language for every value: semantic roles in every theme and mode.",
    figure: `${counts.themes} × 2`,
    unit: "themes × modes",
    links: [
      { label: "Every token", href: "/tokens" },
      { label: "Tokens in Figma", href: "/tokens/figma" },
    ],
    audience: "For designers and theme authors",
  },
  {
    title: "Releases",
    package: "evidence",
    text: "The lifecycle of every entry, the pinned build and its signed provenance.",
    figure: String(counts.entries),
    unit: "entries tracked",
    links: [
      { label: "Status matrix", href: "/releases" },
      { label: "Pinned build", href: "/releases" },
    ],
    audience: "For tech leads, security, procurement",
  },
];

function PathCard({ path }: { path: Path }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <Subtitle size="large">{path.title}</Subtitle>
        <code>{path.package}</code>
      </div>
      <Body>{path.text}</Body>
      <div className={styles.readout}>
        <strong>{path.figure}</strong>
        <span>{path.unit}</span>
      </div>
      <ul className={styles.links}>
        {path.links.map((link) => (
          <li key={link.label}>
            <Link href={link.href}>
              {link.label}
              <ArrowRight size={14} />
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.audience}>{path.audience}</p>
    </article>
  );
}

/** Sheet 02: the four contracts, each a way in. */
export function PathsSheet() {
  return (
    <Sheet
      id="where-to-start"
      title="Where to start"
      labelledBy="paths-title"
      meta={[
        { term: "Packages", value: "2" },
        { term: "Direction", value: "style → behavior" },
      ]}
    >
      <h2 id="paths-title" className="u-visually-hidden">
        The four contracts
      </h2>
      <Cells columns={4}>
        {PATHS.slice(0, 3).map((path) => (
          <PathCard key={path.title} path={path} />
        ))}
        <DarkRoot>
          <PathCard path={PATHS[3]!} />
        </DarkRoot>
      </Cells>
    </Sheet>
  );
}
