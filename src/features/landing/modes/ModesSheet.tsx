import { Cells } from "@/components/docs/Cells";
import { Dim } from "@/components/docs/Dim";
import { Sheet } from "@/components/docs/Sheet";
import { Body, Title } from "@/components/docs/Type";
import { LightsSplit } from "./LightsSplit";
import styles from "./Modes.module.scss";

/** Sheet 02: one attribute on the root resolves every token for light or dark. */
export function ModesSheet() {
  return (
    <Sheet
      id="modes"
      title="Modes"
      label="One root, every mode"
      labelledBy="modes-title"
      meta={[
        { term: "Attribute", value: "data-scnx-resolved-mode" },
        { term: "Pairs", value: "checked in both" },
      ]}
    >
      <Cells className={styles.two}>
        <div className={styles.copy}>
          <Title id="modes-title">Drag to switch the lights.</Title>
          <Body>
            Same markup, same components. One attribute on the root resolves every token for light
            or dark, and contrast is verified in both.
          </Body>
          <div className={styles.dim}>
            <Dim>one attribute</Dim>
          </div>
        </div>
        <LightsSplit />
      </Cells>
    </Sheet>
  );
}
