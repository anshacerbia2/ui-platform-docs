"use client";

import { useState } from "react";
import styles from "./Motion.module.scss";

/**
 * A dot that crosses its track with one action's duration and easing (the generated
 * `[data-token]` rules): the outer track carries the duration, the dot the easing. Under
 * reduced motion it moves at once.
 */
export function MotionDemo({ action }: { action: string }) {
  const [across, setAcross] = useState(false);
  return (
    <span className={styles.demo}>
      <span className={styles.track} data-token={`motion.${action}.duration`}>
        <span
          className={styles.dot}
          data-token={`motion.${action}.easing`}
          data-across={across || undefined}
        />
      </span>
      <button type="button" className={styles.play} onClick={() => setAcross(!across)}>
        Play {action}
      </button>
    </span>
  );
}
