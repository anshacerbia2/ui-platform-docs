import type { ReactNode } from "react";
import styles from "./Lead.module.scss";

/** A sheet's lead (scnx-platform square.css `.sq-lead`): its large heading and lede, a line below. */
export function Lead({ children }: { children: ReactNode }) {
  return <div className={styles.lead}>{children}</div>;
}
