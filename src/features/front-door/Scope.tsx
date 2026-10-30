import type { Curve } from "./data";
import styles from "./FrontDoor.module.scss";

/** A share of the plot, to two places. */
const plot = (n: number) => +(n * 100).toFixed(2);

/** A cubic-bezier() as an SVG path on a 100 by 100 plot, time across and progress up. */
function path(easing: string) {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = (/\(([^)]*)\)/.exec(easing)?.[1] ?? "")
    .split(",")
    .map(Number);
  return `M0 100 C${plot(x1)} ${plot(1 - y1)} ${plot(x2)} ${plot(1 - y2)} 100 0`;
}

/**
 * The motion world's instrument (the owner, 2026-10-30): an oscilloscope's graticule
 * with the motion tokens' curves traced on it, a dot riding each. The dot crosses at a
 * constant speed and climbs by the token's own easing, so the path it draws is the
 * curve: the tokens move it, slowed eight times to be seen (FrontDoor.module.scss).
 */
export function Scope({ curves }: { curves: Curve[] }) {
  return (
    <div className={styles.scope} aria-hidden="true">
      <div className={styles.screenBox}>
        <div className={styles.plot}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.traces}>
            {curves.map((c) => (
              <path key={c.id} d={path(c.easing)} data-curve={c.id} />
            ))}
          </svg>
          {curves.map((c) => (
            <span key={c.id} className={styles.rider} data-curve={c.id}>
              <i />
            </span>
          ))}
        </div>
      </div>
      <ol className={styles.legend}>
        {curves.map((c) => (
          <li key={c.id} data-curve={c.id}>
            <b>{c.roles.join(" · ")}</b>
            <span>
              {c.duration} · {c.easing.replace("cubic-bezier", "")}
            </span>
          </li>
        ))}
        <li className={styles.slow}>×8 slow motion</li>
      </ol>
    </div>
  );
}
