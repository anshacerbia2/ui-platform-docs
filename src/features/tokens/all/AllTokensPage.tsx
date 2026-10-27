import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { Swatch } from "@/components/docs/Swatch";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/components/shell/PageToc";
import { tokenList, tokenThemes } from "@/shared/lib/reference";
import { GROUPS, groupId } from "../tokens";
import styles from "./AllTokens.module.scss";

/**
 * Every canonical token, grouped by its first two segments, with its value per theme
 * and mode: the lookup table behind the category pages.
 */
export function AllTokensPage() {
  const themes = Object.keys(tokenThemes);
  return (
    <DocsLayout aside={<PageToc items={GROUPS.map((g) => ({ id: groupId(g), title: g }))} />}>
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "All tokens" }]}
        title="All tokens"
        lead={
          <>
            All {tokenList.length} canonical tokens with their value in every theme and mode, for
            looking one up. To choose a token, start from its category:{" "}
            <TextLink href="/tokens/color">Color</TextLink> explains the roles and when to use each.
          </>
        }
      />
      {GROUPS.map((group) => {
        const rows = tokenList.filter((t) => t.name.startsWith(`${group}.`));
        return (
          <Sheet
            key={group}
            id={groupId(group)}
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
