import styles from "./sections.module.scss";

const PRODUCTS = ["Workspace", "Identity", "Organization", "HCM", "Travel Operations", "Agent Runtime", "Billing", "Platform Admin"];

export function Marquee() {
  return (
    <section className={styles.marquee} aria-label="Built for">
      <p className={styles.marqueeLead}>Built to power every Scnehaux product, from identity to agents</p>
      <div className={styles.marqueeMask}>
        <ul className={styles.marqueeTrack}>
          {[...PRODUCTS, ...PRODUCTS].map((name, index) => (
            <li key={`${name}-${index >= PRODUCTS.length ? "b" : "a"}`} className={styles.marqueeItem} aria-hidden={index >= PRODUCTS.length || undefined}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
