import Link from "next/link";
import { SECTIONS } from "@/shared/lib/site";
import { ComponentMark, PrimitiveMark, ReleaseMark, TokenMark } from "@/components/docs/Icons";
import { SectionHead } from "./SectionHead";
import styles from "./closing.module.scss";
import sectionStyles from "./sections.module.scss";

const MARKS = {
  primitive: PrimitiveMark,
  component: ComponentMark,
  token: TokenMark,
  release: ReleaseMark,
};

export function Pillars() {
  return (
    <section className={sectionStyles.stack} aria-labelledby="pillars-title">
      <SectionHead
        id="pillars-title"
        title="Four contracts. One system."
        note="Adopt the behavior alone, or the full look. Every page links its primitive, its tokens, and its release evidence."
      />
      <div className={styles.pillars}>
        {SECTIONS.map(({ href, label, mark, description, package: pkg }) => {
          const Mark = MARKS[mark];
          return (
            <Link key={href} href={href} className={styles.pillar}>
              <span className={styles.pillarMark}>
                <Mark size={28} />
              </span>
              <span className={styles.pillarText}>
                <span className={styles.pillarTitle}>{label}</span>
                <span className={styles.pillarBody}>{description}</span>
              </span>
              <span className={styles.pillarPackage}>{pkg}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
