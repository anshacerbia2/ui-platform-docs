import Link from "next/link";
import type { Route } from "next";
import { Check } from "@/components/docs/Icons";
import { Lead } from "@/components/docs/Lead";
import { Sheet } from "@/components/docs/Sheet";
import { Title } from "@/components/docs/Type";
import { Badge } from "@/components/system/Badge";
import { pin } from "@/shared/lib/reference";
import { matrix } from "../data";
import styles from "./Releases.module.scss";

const Passed = () => (
  <span className={styles.check} role="img" aria-label="Yes">
    <Check size={14} />
  </span>
);
const None = () => <span className={styles.none} role="img" aria-label="None" />;

/**
 * Sheet 04: every styled component of the pinned build, with its lifecycle and what
 * its page is generated from (specification, API, hooks, contrast). No gate is shown
 * that the build does not report.
 */
export function ReleasesSheet() {
  return (
    <Sheet
      id="releases"
      title="Releases"
      labelledBy="releases-title"
      meta={[
        { term: "Generated from", value: "packed tarballs" },
        { term: "Build", value: pin.commit.slice(0, 7) },
      ]}
    >
      <Lead>
        <div className={styles.lead}>
          <Title id="releases-title">Nothing here is stable until it is proven.</Title>
          <Link href="/releases" className={styles.open}>
            Open the status matrix
          </Link>
        </div>
      </Lead>
      <div className={styles.wrap}>
        <table className={styles.matrix}>
          <caption className="u-visually-hidden">
            Each styled component in the pinned build: lifecycle and generated sources
          </caption>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Lifecycle</th>
              <th scope="col">Spec</th>
              <th scope="col">API</th>
              <th scope="col">Hooks</th>
              <th scope="col">Contrast</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.slug}>
                <td>
                  <Link href={`/components/${row.slug}` as Route}>
                    <strong>{row.title}</strong>
                  </Link>
                  {row.primitive ? <small>{row.primitive}</small> : null}
                </td>
                <td>
                  <Badge size="small">{row.stability}</Badge>
                </td>
                <td>{row.spec ? <Passed /> : <None />}</td>
                <td>{row.api ? <Passed /> : <None />}</td>
                <td className={styles.num}>{row.hooks || <None />}</td>
                <td className={styles.num}>
                  {row.contrast.total ? `${row.contrast.pass}/${row.contrast.total}` : <None />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.foot}>
        <span>
          <b>Support</b> chromium, firefox, webkit · react ^19
        </span>
        <span>SLSA build L2 · CycloneDX SBOM</span>
      </p>
    </Sheet>
  );
}
