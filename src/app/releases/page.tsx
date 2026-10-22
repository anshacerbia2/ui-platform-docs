import type { Route } from "next";
import type { Metadata } from "next";
import Link from "next/link";
import { DocsLayout } from "@/features/site-shell/DocsLayout";
import { PageToc } from "@/features/reference/PageToc";
import { Code, Section, Table } from "@/features/reference/Section";
import { StabilityBadge } from "@/features/reference/Status";
import styles from "@/features/reference/reference.module.scss";
import { entries, pin } from "@/shared/lib/reference";
import { CodeBlock } from "@/shared/ui/CodeBlock";

export const metadata: Metadata = { title: "Releases" };

export default function Page() {
  const rows = entries.toSorted((a, b) => a.entry.localeCompare(b.entry));
  const counts = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.stability]: (acc[r.stability] ?? 0) + 1 }), {});
  const verify = pin.packages
    .map(
      (p) =>
        `gh attestation verify ${p.tarball} --repo ${pin.repository} \\\n  --signer-workflow ${pin.signerWorkflow} \\\n  --source-ref ${pin.ref} --source-digest ${pin.commit}`,
    )
    .join("\n\n");
  return (
    <DocsLayout
      aside={
        <PageToc
          items={[
            { id: "build", title: "Pinned build" },
            { id: "verify", title: "Verify" },
            { id: "status", title: "Status matrix" },
          ]}
        />
      }
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Releases</h1>
        <p className={styles.lead}>
          The build this site documents, how to verify it, and the stability of every public entry. Version 2.0 is in beta: its tarballs are attested on every
          CI run of main, and the npm release is staged for a maintainer&apos;s approval.
        </p>
      </header>
      <Section id="build" title="Pinned build" source="vendor/ui-platform/pin.json">
        <Table
          caption="Pinned packages"
          head={["Package", "Tarball", "sha256"]}
          rows={pin.packages.map((p) => [
            <Code key="n">
              {p.name}@{p.version}
            </Code>,
            <Code key="t">{p.tarball}</Code>,
            <Code key="s">{p.sha256}</Code>,
          ])}
        />
        <p className={styles.lead}>
          Built from{" "}
          <a className={styles.link} href={`https://github.com/${pin.repository}/commit/${pin.commit}`}>
            {pin.repository}@{pin.commit.slice(0, 7)}
          </a>{" "}
          on main by{" "}
          <a className={styles.link} href={pin.run}>
            its CI run
          </a>
          . ui-platform builds reproducibly, so a pack of that commit is byte-identical.
        </p>
      </Section>
      <Section id="verify" title="Verify" source="SLSA v1 provenance · Sigstore">
        <p className={styles.lead}>
          Each tarball carries a SLSA build provenance attestation and an SBOM, signed by ui-platform&apos;s CI workflow. This site&apos;s CI runs the same
          commands before every build.
        </p>
        <CodeBlock code={verify} title="terminal" numbered={false} />
      </Section>
      <Section
        id="status"
        title="Status matrix"
        source={Object.entries(counts)
          .map(([k, v]) => `${v} ${k}`)
          .join(" · ")}
      >
        <Table
          caption="Stability of every public entry"
          head={["Entry", "Kind", "Stability", "Page"]}
          rows={rows.map((r) => [
            <Code key="e">{r.entry}</Code>,
            r.entryKind ?? r.kind,
            <StabilityBadge key="s" stability={r.stability} />,
            r.page ? (
              <Link key="p" className={styles.link} href={r.page as Route}>
                Open
              </Link>
            ) : (
              "—"
            ),
          ])}
        />
      </Section>
    </DocsLayout>
  );
}
