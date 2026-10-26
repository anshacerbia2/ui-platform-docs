"use client";

import { Tabs } from "@/components/system/Tabs";
import { useState } from "react";
import styles from "./Details.module.scss";

/** The real Tabs, mirrored: arrow keys follow the reading direction. */
export function RtlDemo() {
  const [rtl, setRtl] = useState(false);
  const labels = rtl ? ["نظرة عامة", "الأعضاء", "السجل"] : ["Overview", "Members", "Audit"];
  return (
    <div className={styles.demoInset}>
      <div dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"}>
        <Tabs defaultValue="a">
          <Tabs.List aria-label="Sample">
            <Tabs.Tab value="a">{labels[0]}</Tabs.Tab>
            <Tabs.Tab value="b">{labels[1]}</Tabs.Tab>
            <Tabs.Tab value="c">{labels[2]}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
      <div className={styles.demoRow}>
        <span className={styles.demoMeta}>{rtl ? "← next tab" : "→ next tab"}</span>
        <button
          type="button"
          className={styles.demoButton}
          aria-pressed={rtl}
          onClick={() => setRtl(!rtl)}
        >
          dir=&quot;{rtl ? "rtl" : "ltr"}&quot;
        </button>
      </div>
    </div>
  );
}

/** Reduced motion stops the movement; the state still changes. */
export function MotionDemo() {
  const [reduce, setReduce] = useState(false);
  return (
    <div className={styles.demoInset}>
      <div className={styles.motionTrack} data-reduce={reduce || undefined}>
        <span className={styles.motionDot} />
      </div>
      <div className={styles.demoRow}>
        <span className={styles.demoMeta}>
          prefers-reduced-motion: {reduce ? "reduce" : "no-preference"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={reduce}
          aria-label="Reduce motion"
          className={styles.switch}
          onClick={() => setReduce(!reduce)}
        >
          <span />
        </button>
      </div>
    </div>
  );
}
