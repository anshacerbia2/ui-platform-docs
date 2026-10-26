import { pin, type EntryRow } from "@/shared/lib/reference";
import { Code } from "./Section";
import styles from "./reference.module.scss";

const MEANING: Record<string, string> = {
  experimental: "May change or be removed in any release.",
  candidate:
    "Feature-complete and covered by the release gates; its API may still change before it is promoted to stable.",
  stable:
    "Covered by semantic versioning: no breaking change outside a major release. Stable requires browser conformance of its specification.",
  deprecated: "Kept for compatibility; a replacement is named in the release notes.",
};

export function StabilityBadge({ stability }: { stability: string }) {
  return (
    <span className={styles.stability} data-stability={stability}>
      {stability}
    </span>
  );
}

export function Status({ row }: { row: EntryRow }) {
  const pkg = pin.packages.find((p) => p.name === row.package);
  return (
    <dl className={styles.facts}>
      <div>
        <dt>Stability</dt>
        <dd>
          <StabilityBadge stability={row.stability} /> {MEANING[row.stability]}
        </dd>
      </div>
      <div>
        <dt>Entry</dt>
        <dd>
          <Code>{row.entry}</Code>
          {row.entryKind ? ` · ${row.entryKind}` : ""}
        </dd>
      </div>
      <div>
        <dt>Package</dt>
        <dd>
          <Code>
            {row.package}@{row.version}
          </Code>
        </dd>
      </div>
      <div>
        <dt>Built from</dt>
        <dd>
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
        </dd>
      </div>
      {pkg ? (
        <div>
          <dt>Tarball sha256</dt>
          <dd>
            <Code>{pkg.sha256}</Code>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
