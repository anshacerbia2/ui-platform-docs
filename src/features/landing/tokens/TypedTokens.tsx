import styles from "../sections/sections.module.scss";
import { TokenStates } from "./TokenStates";

export function TypedTokens() {
  return (
    <section className={styles.split} aria-labelledby="tokens-title">
      <div className={styles.splitCopy}>
        <span className={styles.eyebrow}>Tokens that know the rules</span>
        <h2 id="tokens-title" className={styles.title}>
          Impossible states
          <br />
          have no name.
        </h2>
        <p className={styles.splitText}>
          Every token name reads as scheme, role, emphasis, and state. A surface can be hovered or
          pressed, but never focused: the token grammar has no such name, and the system&apos;s
          build rejects one, so it never reaches your users.
        </p>
      </div>
      <div className={styles.splitVisual}>
        <TokenStates />
      </div>
    </section>
  );
}
