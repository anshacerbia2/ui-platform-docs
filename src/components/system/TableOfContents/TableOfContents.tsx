"use client";

import {
  TableOfContents as SystemTableOfContents,
  type TableOfContentsProps,
} from "@scnx/system/components/table-of-contents";

export type { TableOfContentsProps };

/**
 * The design system's TableOfContents, as the docs use it: controlled, so its current
 * link is the page's one "here" (ui-platform TDD primitives P27; TDD docs-site D12).
 */
export function TableOfContents(props: TableOfContentsProps) {
  return <SystemTableOfContents {...props} />;
}
