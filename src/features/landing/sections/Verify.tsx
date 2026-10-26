import Link from "next/link";
import { pin } from "@/shared/lib/reference";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { DarkRoot } from "@/shared/ui/DarkRoot";
import { ArrowRight } from "@/shared/ui/icons";
import styles from "./closing.module.scss";

export function Verify() {
  const system = pin.packages.find((p) => p.name === "@scnx/system");
  const command = `gh attestation verify ${system?.tarball ?? "scnx-system.tgz"} \\\n  --repo ${pin.repository} \\\n  --signer-workflow ${pin.signerWorkflow} \\\n  --source-ref refs/heads/main`;
  return (
    <section className={styles.verify} aria-labelledby="verify-title">
      <div className={styles.verifySlot}>
        <DarkRoot>
          <div className={styles.verifyMain}>
            <div className={styles.verifyCopy}>
              <span className={styles.eyebrowInverse}>Don&apos;t trust us</span>
              <h2 id="verify-title" className={styles.verifyTitle}>
                Verify it yourself, in ten seconds.
              </h2>
              <p className={styles.verifyText}>
                Every tarball is built in public CI and carries SLSA provenance, signed through
                Sigstore and recorded in its public transparency log. This site&apos;s own CI runs
                this check on the tarballs it documents.
              </p>
            </div>
            <CodeBlock code={command} title="terminal" numbered={false} />
            <ul className={styles.checklist}>
              <li>signed by ui-platform&apos;s CI workflow</li>
              <li>built from a commit on main</li>
              <li>digest matches the tarball you have</li>
            </ul>
          </div>
        </DarkRoot>
      </div>
      <div className={styles.verifySide}>
        <Link href="/components/button#accessibility" className={styles.sideCard}>
          <span className={styles.eyebrow}>Accessibility, per component</span>
          <span className={styles.sideTitle}>
            A keyboard, focus, and contrast contract on every page, generated from the
            specification.
          </span>
          <span className={styles.sideLink}>
            Read the Button contract <ArrowRight size={14} />
          </span>
        </Link>
        {/* /llms.txt is a route handler, not a page, so it is a plain link. */}
        {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
        <a href="/llms.txt" className={styles.sideCard}>
          <span className={styles.eyebrow}>Agent-ready</span>
          <span className={styles.sideTitle}>
            Your coding agent reads the same specifications and API, as plain text.
          </span>
          <span className={styles.sideChip}>/llms.txt</span>
        </a>
      </div>
    </section>
  );
}
