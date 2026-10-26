"use client";

import { Tabs as SystemTabs, type TabsProps } from "@scnx/system/components/tabs";

export type { TabsProps };

function TabsRoot(props: TabsProps) {
  return <SystemTabs {...props} />;
}

/**
 * The design system's Tabs, as the docs use it: the root and its parts, `Tabs.List`,
 * `Tabs.Tab` and `Tabs.Panel`, exactly as the package composes them.
 */
export const Tabs = Object.assign(TabsRoot, {
  List: SystemTabs.List,
  Tab: SystemTabs.Tab,
  Panel: SystemTabs.Panel,
});
