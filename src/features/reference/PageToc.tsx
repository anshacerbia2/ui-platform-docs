"use client";

import { TableOfContents } from "@scnx/system/components/table-of-contents";
import styles from "./reference.module.scss";

/** "On this page", with the system's own TableOfContents (scroll-spy included). */
export function PageToc({ items }: { items: { id: string; title: string }[] }) {
  return (
    <div className={styles.toc}>
      <TableOfContents label="On this page" items={items.map((i) => ({ ...i, url: `#${i.id}` }))} navbarOffset={104} />
    </div>
  );
}
