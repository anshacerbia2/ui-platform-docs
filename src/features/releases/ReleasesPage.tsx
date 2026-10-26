import { Block } from "@/components/docs/Block";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { StabilityBadge } from "@/components/docs/StabilityBadge";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/components/shell/PageToc";
import { entries, pin } from "@/shared/lib/reference";

/** The build this site documents, how to verify it, and the stability of every public entry. */
export function ReleasesPage() {
  const rows = entries.toSorted((a, b) => a.entry.localeCompare(b.entry));
  const counts = rows.reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.stability]: (acc[r.stability] ?? 0) + 1 }),
    {},
  );
  const verify = pin.packages
    .map(
      (p) =>
        `$ gh attestation verify ${p.tarball} --repo ${pin.repository} \\\n    --signer-workflow ${pin.signerWorkflow} \\\n    --source-ref ${pin.ref} --source-digest ${pin.commit}`,
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
      <PageHead
        title="Releases"
        lead="The build this site documents, how to verify it, and the stability of every public entry. Version 2.0 is in beta: its tarballs are attested on every CI run of main, and the npm release is staged for a maintainer's approval."
      />
      <Sheet
        id="build"
        title="Pinned build"
        meta={[{ term: "From", value: "vendor/ui-platform/pin.json" }]}
      >
        <DataTable
          caption="Pinned packages"
          head={["Package", "Tarball", "sha256"]}
          rows={pin.packages.map((p) => [
            <InlineCode key="n">{`${p.name}@${p.version}`}</InlineCode>,
            <InlineCode key="t">{p.tarball}</InlineCode>,
            <InlineCode key="s">{p.sha256}</InlineCode>,
          ])}
        />
        <Block>
          <p>
            Built from{" "}
            <TextLink href={`https://github.com/${pin.repository}/commit/${pin.commit}`}>
              {pin.repository}@{pin.commit.slice(0, 7)}
            </TextLink>{" "}
            on main by <TextLink href={pin.run}>its CI run</TextLink>. ui-platform builds
            reproducibly, so a pack of that commit is byte-identical.
          </p>
        </Block>
      </Sheet>
      <Sheet
        id="verify"
        title="Verify"
        meta={[{ term: "Provenance", value: "SLSA v1 · Sigstore" }]}
      >
        <Block>
          <p>
            Each tarball carries a SLSA build provenance attestation and an SBOM, signed by
            ui-platform&apos;s CI workflow. This site&apos;s CI runs the same commands before every
            build.
          </p>
          <CodeBlock code={verify} title="terminal" numbered={false} shell />
        </Block>
      </Sheet>
      <Sheet
        id="status"
        title="Status matrix"
        meta={Object.entries(counts).map(([term, count]) => ({ term, value: String(count) }))}
      >
        <DataTable
          caption="Stability of every public entry"
          head={["Entry", "Kind", "Stability", "Page"]}
          rows={rows.map((r) => [
            <InlineCode key="e">{r.entry}</InlineCode>,
            r.entryKind ?? r.kind,
            <StabilityBadge key="s" stability={r.stability} />,
            r.page ? (
              <TextLink key="p" href={r.page}>
                Open
              </TextLink>
            ) : (
              "—"
            ),
          ])}
        />
      </Sheet>
    </DocsLayout>
  );
}
