import { FactGrid } from "@/components/docs/FactGrid";
import { InlineCode } from "@/components/docs/InlineCode";
import { StabilityBadge } from "@/components/docs/StabilityBadge";
import { pin, type EntryRow } from "@/shared/lib/reference";
import styles from "./Reference.module.scss";

const MEANING: Record<string, string> = {
  experimental: "May change or be removed in any release.",
  candidate:
    "Feature-complete and covered by the release gates; its API may still change before it is promoted to stable.",
  stable:
    "Covered by semantic versioning: no breaking change outside a major release. Stable requires browser conformance of its specification.",
  deprecated: "Kept for compatibility; a replacement is named in the release notes.",
};

/** An entry's lifecycle, its package, and the build it was documented from. */
export function Status({ row }: { row: EntryRow }) {
  const pkg = pin.packages.find((p) => p.name === row.package);
  const facts = [
    {
      term: "Stability",
      aside: <StabilityBadge stability={row.stability} />,
      value: MEANING[row.stability],
    },
    {
      term: "Entry",
      value: (
        <>
          <InlineCode>{row.entry}</InlineCode>
          {row.entryKind ? ` · ${row.entryKind}` : ""}
        </>
      ),
    },
    { term: "Package", value: <InlineCode>{`${row.package}@${row.version}`}</InlineCode> },
    {
      term: "Built from",
      value: (
        <>
          <a
            className={styles.link}
            href={`https://github.com/${pin.repository}/commit/${pin.commit}`}
          >
            ui-platform {pin.commit.slice(0, 7)}
          </a>{" "}
          on main, by{" "}
          <a className={styles.link} href={pin.run}>
            this CI run
          </a>
        </>
      ),
    },
    ...(pkg ? [{ term: "Tarball sha256", value: <InlineCode>{pkg.sha256}</InlineCode> }] : []),
  ];
  return <FactGrid label="Status" items={facts} />;
}
