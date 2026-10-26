import { Sheet } from "@/components/docs/Sheet";
import { landing } from "@/shared/lib/reference";
import { THEME_IDS } from "@/shared/lib/themes";
import { ThemeLab } from "./ThemeLab";

/** Sheet 03: one root, a verified theme, in every published theme and mode. */
export function BrandSheet() {
  return (
    <Sheet
      id="brand"
      title="Brand"
      label="Bring your brand"
      labelledBy="brand-title"
      meta={[
        { term: "Themes", value: String(THEME_IDS.length) },
        { term: "Space", value: "OKLCH, sRGB-safe" },
        { term: "Gate", value: "WCAG 2.2" },
      ]}
    >
      <ThemeLab lab={landing.lab} swatches={landing.swatches} />
    </Sheet>
  );
}
