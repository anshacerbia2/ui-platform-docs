import { Cta } from "@/components/docs/Cta";
import { ArrowRight } from "@/components/docs/Icons";
import { BOM, CURVES, type WorldData } from "./data";
import { Scope } from "./Scope";
import { Specimen } from "./Specimen";
import styles from "./FrontDoor.module.scss";

/**
 * The bench's title block, as a drawing has one in its corner: the parts list this
 * world reads off the specimen, then the sheet's own facts. The design system lists
 * each part's entry; the primitives list what lies under its paint.
 */
function TitleBlock({ world }: { world: WorldData }) {
  const bare = world.id === "primitives";
  return (
    <div className={styles.block} aria-hidden="true">
      <p className={styles.blockHead}>
        <span>{bare ? "Behavior beneath" : "Bill of materials"}</span>
        <span>{BOM.length} parts</span>
      </p>
      <ol className={styles.bom}>
        {BOM.map((row) => (
          <li key={row.no} data-bare={bare && row.keys === "no behavior" ? "" : undefined}>
            <b>{row.no}</b>
            <span>{row.part}</span>
            <span>{bare ? row.under : row.entry}</span>
            {bare && row.keys !== "no behavior" && <small>{row.keys}</small>}
          </li>
        ))}
      </ol>
      <p className={styles.blockFoot}>
        <span>Scale 1:1</span>
        <span>Sheet {world.no}/03</span>
        <span>
          {world.package} {world.status}
        </span>
      </p>
    </div>
  );
}

/**
 * One world of the front door (the owner, 2026-10-30): its copy on the left, its bench on
 * the right, where the same specimen is drawn in the world's material. Every world has
 * the same grid, so the specimen stands in the same place in each.
 */
export function World({ world }: { world: WorldData }) {
  return (
    <div className={styles.world} data-world={world.id}>
      <div className={styles.copy}>
        <p className={styles.index}>
          <b>{world.no}</b>
          <span>/ 03</span>
          <span>{world.name}</span>
          {world.id === "motion" && <span className={styles.soon}>Coming soon</span>}
        </p>
        <div className={styles.claim}>
          <h2 className={styles.title}>{world.title}</h2>
          <p className={styles.lede}>{world.lede}</p>
          <Cta href={world.href} variant="primary" icon={<ArrowRight size={16} />}>
            {world.cta}
          </Cta>
        </div>
        <dl className={styles.specs}>
          {world.specs.map((spec) => (
            <div key={spec.term}>
              <dt>{spec.term}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        <span className={styles.numeral} aria-hidden="true">
          {world.no}
        </span>
      </div>
      <div
        className={world.id === "motion" ? `${styles.bench} ${styles.screen}` : styles.bench}
        data-bench=""
      >
        <p className={styles.benchHead} aria-hidden="true">
          <span>
            Bench {world.no} · {world.id === "motion" ? "Scope" : "Release card"}
          </span>
          <span>Drag, scroll or ← →</span>
        </p>
        {world.id === "motion" && <Scope curves={CURVES} />}
        <div className={styles.mount}>
          <Specimen />
        </div>
        {world.id !== "motion" && <TitleBlock world={world} />}
      </div>
    </div>
  );
}
