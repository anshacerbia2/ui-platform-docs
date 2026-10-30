"use client";

import { SegmentedControl } from "@/components/system/SegmentedControl";

/** The specimen's target: the design system's SegmentedControl on RadioGroupBase, production chosen. */
export function Target() {
  return (
    <SegmentedControl aria-label="Target" defaultValue="production" size="small">
      <SegmentedControl.Item value="staging">Staging</SegmentedControl.Item>
      <SegmentedControl.Item value="production">Production</SegmentedControl.Item>
      <SegmentedControl.Item value="canary">Canary</SegmentedControl.Item>
    </SegmentedControl>
  );
}
