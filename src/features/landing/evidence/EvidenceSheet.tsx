import Link from "next/link";
import { Cells } from "@/components/docs/Cells";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { ArrowRight } from "@/components/docs/Icons";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Eyebrow, Subtitle, Title } from "@/components/docs/Type";
import { gauges, verifyCommand } from "../data";
import styles from "./Evidence.module.scss";

/** Sheet 06: the figures, each linked to where it is enforced, and the check a reader runs. */
export function EvidenceSheet() {
  return (
    <Sheet
      id="evidence"
      title="Evidence"
      label="Don't trust us"
      labelledBy="evidence-title"
      meta={[
        { term: "Signed", value: "Sigstore" },
        { term: "Provenance", value: "SLSA L2" },
      ]}
    >
      <ul className={styles.gauges} aria-label="By the numbers">
        {gauges.map((gauge) => (
          <li key={gauge.value}>
            <a href={gauge.href} className={styles.gauge}>
              <strong>{gauge.value}</strong>
              <span className={styles.scale} data-level={gauge.level} aria-hidden="true" />
              <span className={styles.gaugeText}>{gauge.text}</span>
            </a>
          </li>
        ))}
      </ul>
      <Cells className={styles.evidence}>
        <div className={styles.verify}>
          <Title id="evidence-title">Verify it yourself, in ten seconds.</Title>
          <Body>
            Every tarball is built in public CI and carries SLSA provenance, signed through Sigstore
            and recorded in its public transparency log. This site&apos;s own CI runs this check on
            the tarballs it documents.
          </Body>
          <CodeBlock code={verifyCommand} title="your machine" numbered={false} shell />
        </div>
        <Cells>
          <Link href="/components/button#accessibility" className={styles.card}>
            <Eyebrow>Accessibility, per component</Eyebrow>
            <Subtitle size="medium">
              A keyboard, focus and contrast contract on every page, generated from the
              specification.
            </Subtitle>
            <span className={styles.link}>
              Read the Button contract <ArrowRight size={14} />
            </span>
          </Link>
          {/* /llms.txt is a route handler, not a page, so it is a plain link. */}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/llms.txt" className={styles.card}>
            <Eyebrow>Agent-ready</Eyebrow>
            <Subtitle size="medium">
              Your coding agent reads the same specifications and API, as plain text.
            </Subtitle>
            <code className={styles.chip}>/llms.txt</code>
          </a>
        </Cells>
      </Cells>
    </Sheet>
  );
}
