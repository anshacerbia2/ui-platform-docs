"use client";

import {
  TableOfContents as SystemTableOfContents,
  type TableOfContentsProps,
} from "@scnx/system/components/table-of-contents";

export type { TableOfContentsProps };

/**
 * The design system's TableOfContents, as the docs use it: controlled, so its current
 * link is the page's one "here" (ui-platform TDD primitives P27; TDD docs-site D12).
 * Its parts compose the list when a link holds more than its title (a number).
 */
export const TableOfContents = Object.assign(
  function TableOfContents(props: TableOfContentsProps) {
    return <SystemTableOfContents {...props} />;
  },
  {
    List: SystemTableOfContents.List,
    Item: SystemTableOfContents.Item,
    Link: SystemTableOfContents.Link,
  },
);
