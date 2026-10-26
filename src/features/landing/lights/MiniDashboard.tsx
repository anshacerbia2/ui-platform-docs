import { Button } from "@scnx/system/components/button";
import styles from "./Lights.module.scss";

const KPIS = [
  { label: "MRR", value: "$184.2k", delta: "+12.4%", tone: "success" },
  { label: "Net retention", value: "118%", delta: "+3 pts", tone: "success" },
  { label: "Churn", value: "1.4%", delta: "+0.2 pts", tone: "warning" },
] as const;
const BARS = [42, 48, 45, 55, 52, 60, 58, 66, 63, 72, 70, 80, 84, 92];
const INVOICES = [
  { name: "Sinar Logistics", status: "Paid", amount: "$12.4k", tone: "success" },
  { name: "Pelita Energi", status: "Paid", amount: "$9.8k", tone: "success" },
  { name: "Kirana Group", status: "Overdue", amount: "$4.1k", tone: "warning" },
  { name: "Tirta Foods", status: "Paid", amount: "$3.6k", tone: "success" },
] as const;

/** Sample dashboard, identical in both panes; only the theme root's mode differs. */
export function MiniDashboard({ hidden }: { hidden?: boolean }) {
  return (
    <div className={styles.dashboard} aria-hidden={hidden || undefined} inert={hidden || undefined}>
      <div className={styles.rail}>
        <span className={styles.railBrand} />
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={styles.railItem} />
        ))}
      </div>
      <div className={styles.main}>
        <div className={styles.top}>
          <div className={styles.heading}>
            <span className={styles.headingTitle}>Revenue</span>
            <span className={styles.muted}>Northwind · last 30 days</span>
          </div>
          <div className={styles.topActions}>
            <span className={styles.segment}>
              <span>7d</span>
              <span data-on="">30d</span>
              <span>90d</span>
            </span>
            <Button variant="primary" tabIndex={-1}>
              Export
            </Button>
          </div>
        </div>
        <div className={styles.kpis}>
          {KPIS.map((k) => (
            <div key={k.label} className={styles.card}>
              <span className={styles.muted}>{k.label}</span>
              <span className={styles.kpiValue}>{k.value}</span>
              <span className={styles.pill} data-tone={k.tone}>
                {k.delta}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.lower}>
          <div className={`${styles.card} ${styles.chart}`}>
            <span className={styles.cardTitle}>Monthly recurring revenue</span>
            <div className={styles.bars}>
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className={styles.bar}
                  data-h={h}
                  data-recent={i >= 12 || undefined}
                />
              ))}
            </div>
          </div>
          <div className={`${styles.card} ${styles.invoices}`}>
            <span className={styles.cardTitle}>Recent invoices</span>
            {INVOICES.map((row) => (
              <div key={row.name} className={styles.invoice}>
                <span className={styles.invoiceName}>{row.name}</span>
                <span className={styles.pill} data-tone={row.tone}>
                  {row.status}
                </span>
                <span className={styles.amount}>{row.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
