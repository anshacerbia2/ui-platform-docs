import { Cells } from "@/components/docs/Cells";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Title } from "@/components/docs/Type";
import { tokenThemes } from "@/shared/lib/reference";
import { TokenGrammar } from "./TokenGrammar";
import styles from "./Tokens.module.scss";

const standard = Object.values(tokenThemes)[0]?.standard;

/** Sheet 05: token names that know the rules; an impossible state does not compile. */
export function TokensSheet() {
  return (
    <Sheet
      id="tokens"
      title="Tokens"
      label="Tokens that know the rules"
      labelledBy="tokens-title"
      meta={[
        {
          term: "Grammar",
          value: standard ? `${standard.id} ${standard.version}` : "STD-UIP-TKN-001",
        },
        { term: "Checked", value: "at build" },
      ]}
    >
      <Cells className={styles.two}>
        <div className={styles.copy}>
          <Title id="tokens-title">Impossible states have no name.</Title>
          <Body>
            Every token name reads as scheme, role, emphasis, and state. A surface can be hovered or
            pressed, but never focused: the token grammar has no such name, and the system&apos;s
            build rejects one, so it never reaches your users.
          </Body>
          <Body>Pick a state to compile it.</Body>
        </div>
        <TokenGrammar />
      </Cells>
    </Sheet>
  );
}
