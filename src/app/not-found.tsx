import Link from "next/link";
import { DocsLayout } from "@/components/shell/DocsLayout";
import styles from "@/features/reference/reference.module.scss";

export default function NotFound() {
  return (
    <DocsLayout>
      <header className={styles.header}>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.lead}>
          This page does not exist in the documented release. Browse the{" "}
          <Link className={styles.link} href="/components">
            components
          </Link>{" "}
          or{" "}
          <Link className={styles.link} href="/primitives">
            primitives
          </Link>
          .
        </p>
      </header>
    </DocsLayout>
  );
}
