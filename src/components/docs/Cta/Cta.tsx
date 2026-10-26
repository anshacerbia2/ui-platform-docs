import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Shuffle } from "@/components/docs/Shuffle";
import styles from "./Cta.module.scss";

type Variant = "primary" | "secondary" | "ghost";

/**
 * A call to action of the docs chrome, not the Button component (TDD docs-site
 * D14; square.css .sq-cta): a 48px cell in the HUD voice. Primary is ink,
 * secondary has an edge, ghost is bare. A site path renders a client link.
 */
export function Cta({
  href,
  variant = "secondary",
  icon,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  children: string;
}) {
  // the icon follows the label: "Get started →" (square.css .sq-cta)
  const body = (
    <>
      <Shuffle>{children}</Shuffle>
      {icon}
    </>
  );
  const props = { className: `${styles.cta} ${className}`.trim(), "data-variant": variant };
  return href.startsWith("/") ? (
    <Link href={href as Route} {...props}>
      {body}
    </Link>
  ) : (
    <a href={href} {...props}>
      {body}
    </a>
  );
}
