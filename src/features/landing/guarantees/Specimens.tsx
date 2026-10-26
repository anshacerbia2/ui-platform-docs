"use client";

import { useState } from "react";
import { Tabs } from "@/components/system/Tabs";
import styles from "./Guarantees.module.scss";

/** The real Tabs, mirrored: under `dir="rtl"` the arrow keys follow the reading direction. */
export function RtlSpecimen() {
  const [rtl, setRtl] = useState(true);
  const labels = rtl ? ["نظرة عامة", "الأعضاء", "السجل"] : ["Overview", "Members", "Audit"];
  return (
    <div className={styles.rtl}>
      <div dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"}>
        <Tabs defaultValue="a">
          <Tabs.List aria-label="Sample">
            <Tabs.Tab value="a">{labels[0]}</Tabs.Tab>
            <Tabs.Tab value="b">{labels[1]}</Tabs.Tab>
            <Tabs.Tab value="c">{labels[2]}</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </div>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={rtl}
        onClick={() => setRtl(!rtl)}
      >
        dir=&quot;{rtl ? "rtl" : "ltr"}&quot;
      </button>
    </div>
  );
}

/** Reduced motion stops the movement; the state still changes. */
export function MotionSpecimen() {
  const [reduce, setReduce] = useState(false);
  return (
    <div className={styles.motion}>
      <span className={styles.track} data-reduce={reduce || undefined} aria-hidden="true">
        <span />
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={reduce}
        className={styles.switch}
        onClick={() => setReduce(!reduce)}
      >
        <span className={styles.switchTrack} aria-hidden="true" />
        Reduce motion
      </button>
    </div>
  );
}
