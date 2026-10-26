import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { Swatch } from "@/components/docs/Swatch";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/components/shell/PageToc";
import { tokenList, tokenThemes } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";
import styles from "./Tokens.module.scss";

const GROUPS = [...new Set(tokenList.map((t) => t.name.split(".").slice(0, 2).join(".")))];
const idOf = (group: string) => group.replaceAll(".", "-");

/** Every canonical token, grouped by its first two segments, with its value per theme and mode. */
export function TokensPage() {
  const themes = Object.keys(tokenThemes);
  const standard = tokenThemes[themes[0] ?? SITE_THEME]?.standard;
  return (
    <DocsLayout aside={<PageToc items={GROUPS.map((g) => ({ id: idOf(g), title: g }))} />}>
      <PageHead
        title="Tokens"
        lead={
          <>
            {tokenList.length} canonical tokens in {themes.length} themes, each in light and dark,
            generated from the published JSON. Names follow {standard?.id} {standard?.version}:
            scheme, role, emphasis, and state. Use the CSS custom property; a value may change in a
            minor release, a name may not. Designers get the same tokens from the build:{" "}
            <TextLink href="/tokens/figma">Tokens in Figma</TextLink>.
          </>
        }
      />
      {GROUPS.map((group) => {
        const rows = tokenList.filter((t) => t.name.startsWith(`${group}.`));
        return (
          <Sheet
            key={group}
            id={idOf(group)}
            title={group}
            meta={[{ term: "Tokens", value: String(rows.length) }]}
          >
            <DataTable
              caption={`${group} tokens`}
              head={["Token", ...themes.flatMap((t) => [`${t} light`, `${t} dark`])]}
              rows={rows.map((t) => [
                <span key="n" className={styles.token}>
                  {t.type === "color" ? <Swatch token={t.name} /> : null}
                  <InlineCode>{t.cssName}</InlineCode>
                </span>,
                ...themes.flatMap((id) => [
                  <InlineCode key={`${id}l`}>{t.values[id]?.light ?? "—"}</InlineCode>,
                  <InlineCode key={`${id}d`}>{t.values[id]?.dark ?? "—"}</InlineCode>,
                ]),
              ])}
            />
          </Sheet>
        );
      })}
    </DocsLayout>
  );
}
