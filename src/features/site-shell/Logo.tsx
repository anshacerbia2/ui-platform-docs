import { SCNX_BLUE } from "@/shared/ui/brand";
import styles from "./Logo.module.scss";

/** The Scnehaux UI mark: a primitive, a component, and a verified check. Tile in ink, parts in its contrast label. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg className={styles.logo} width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <rect className={styles.tile} x="2" y="2" width="24" height="24" rx="8" />
      <rect className={styles.line} x="7.5" y="7.5" width="6" height="6" rx="1.5" />
      <rect className={styles.fill} x="14.5" y="7.5" width="6" height="6" rx="1.5" />
      <circle className={styles.line} cx="10.5" cy="17.5" r="3" />
      <path className={styles.check} stroke={SCNX_BLUE} d="M15 17.5l2 2 3.5-4" />
    </svg>
  );
}
