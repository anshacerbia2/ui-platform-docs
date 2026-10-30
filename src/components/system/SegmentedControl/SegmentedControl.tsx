"use client";

import {
  SegmentedControl as SystemSegmentedControl,
  type SegmentedControlItemProps,
  type SegmentedControlProps,
} from "@scnx/system/components/segmented-control";

export type { SegmentedControlItemProps, SegmentedControlProps };

/** The design system's SegmentedControl, as the docs use it inside a specimen; `.Item` is a segment. */
export const SegmentedControl = Object.assign(
  function SegmentedControl(props: SegmentedControlProps) {
    return <SystemSegmentedControl {...props} />;
  },
  { Item: SystemSegmentedControl.Item },
);
