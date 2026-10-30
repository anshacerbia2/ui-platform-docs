"use client";

import {
  SegmentedControl as SystemSegmentedControl,
  type SegmentedControlItemProps,
  type SegmentedControlProps,
} from "@scnx/system/components/segmented-control";
import styles from "./SegmentedControl.module.scss";

export type { SegmentedControlItemProps, SegmentedControlProps };

/**
 * The design system's SegmentedControl, as the docs use it; `.Item` is a segment. A
 * control the docs fill from a specification (every value of an option) can hold more
 * segments than its row, so the docs' default lets it wrap.
 */
export const SegmentedControl = Object.assign(
  function SegmentedControl(props: SegmentedControlProps) {
    return (
      <SystemSegmentedControl
        {...props}
        className={props.className ? `${styles.control} ${props.className}` : styles.control}
      />
    );
  },
  { Item: SystemSegmentedControl.Item },
);
