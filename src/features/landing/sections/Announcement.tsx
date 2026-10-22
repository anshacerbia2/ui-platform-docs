import Link from "next/link";
import { DarkRoot } from "@/shared/ui/DarkRoot";
import { ArrowRight } from "@/shared/ui/icons";
import styles from "./sections.module.scss";

export function Announcement() {
  return (
    <DarkRoot>
      <Link href="/components/tabs#accessibility" className={styles.announcement}>
        <span className={styles.announcementTag}>New</span>
        Tabs: arrow keys follow right-to-left layouts, verified in every engine
        <ArrowRight size={14} />
      </Link>
    </DarkRoot>
  );
}
