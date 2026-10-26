import { Badge } from "@/components/system/Badge";
import styles from "./Modes.module.scss";

const KPIS = [
  { label: "MRR", value: "$184.2k", delta: "+12.4%", scheme: "success" },
  { label: "Net retention", value: "118%", delta: "+3 pts", scheme: "success" },
  { label: "Churn", value: "1.4%", delta: "+0.2 pts", scheme: "warning" },
] as const;
const BARS = [34, 42, 39, 51, 48, 60, 58, 66, 71, 69, 82, 94];
const INVOICES = [
  { name: "Sinar Logistics", status: "Paid", amount: "$12.4k", scheme: "success" },
  { name: "Pelita Energi", status: "Paid", amount: "$9.8k", scheme: "success" },
  { name: "Kirana Group", status: "Overdue", amount: "$4.1k", scheme: "warning" },
] as const;

/**
 * A sample dashboard, the same markup in both panes; only its theme root's mode
 * differs. Everything in it is a token or the system's Badge, so the root restyles it.
 */
export function MiniDashboard({ hidden }: { hidden?: boolean }) {
  return (
    <div className={styles.dash} aria-hidden={hidden || undefined} inert={hidden || undefined}>
      <div className={styles.side}>
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className={styles.dashMain}>
        <div className={styles.dashTop}>
          <div>
            <h3>Revenue</h3>
            <p>Northwind, last 30 days</p>
          </div>
          <span className={styles.range} aria-hidden="true">
            <span>7d</span>
            <span data-on="">30d</span>
            <span>90d</span>
          </span>
        </div>
        <div className={styles.kpis}>
          {KPIS.map((kpi) => (
            <div key={kpi.label} className={styles.kpi}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <Badge scheme={kpi.scheme} size="small">
                {kpi.delta}
              </Badge>
            </div>
          ))}
        </div>
        <div className={styles.bars}>
          {BARS.map((height, i) => (
            <i key={height} data-h={height} data-recent={i >= BARS.length - 2 || undefined} />
          ))}
        </div>
        <ul className={styles.invoices}>
          {INVOICES.map((row) => (
            <li key={row.name}>
              <span>{row.name}</span>
              <span>
                <Badge scheme={row.scheme} size="small">
                  {row.status}
                </Badge>
                {row.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
