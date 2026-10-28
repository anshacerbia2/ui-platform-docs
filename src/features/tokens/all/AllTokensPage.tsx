import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { Swatch } from "@/components/docs/Swatch";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { tokenList } from "@/shared/lib/reference";
import { CATEGORIES, exampleValues, GROUPS, groupId } from "../tokens";
import styles from "./AllTokens.module.scss";

// One sheet per domain, its groups (a token's first two segments) inside it, so the
// contents nest: the domain, then its schemes or properties (the owner, 2026-10-28).
const DOMAINS = CATEGORIES.map((c) => ({
  ...c,
  groups: GROUPS.filter((g) => g.startsWith(`${c.domain}.`)),
}));

/**
 * Every canonical token, a sheet per domain and a table per group, with its example
 * value in light and dark: the lookup table behind the category pages.
 */
export function AllTokensPage() {
  return (
    <DocsLayout
      toc={DOMAINS.map((d) => ({
        id: d.domain,
        title: d.title,
        children: d.groups.map((g) => ({ id: groupId(g), title: g.split(".")[1] ?? g })),
      }))}
    >
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "All tokens" }]}
        title="All tokens"
        lead={
          <>
            All {tokenList.length} canonical tokens with their value in light and dark, for looking
            one up. To choose a token, start from its category:{" "}
            <TextLink href="/tokens/color">Colour</TextLink> explains the roles and when to use
            each.
          </>
        }
      />
      {DOMAINS.map((d) => (
        <Sheet
          key={d.domain}
          id={d.domain}
          title={d.title}
          meta={[
            { term: "Groups", value: String(d.groups.length) },
            { term: "Tokens", value: String(d.count) },
          ]}
        >
          {d.groups.map((group) => {
            const rows = tokenList.filter((t) => t.name.startsWith(`${group}.`));
            return (
              <div key={group} className={styles.group}>
                <span id={groupId(group)} className={styles.anchor} />
                <h3 className={styles.head}>
                  <code className={styles.path}>
                    <span>{group.split(".")[0]}.</span>
                    {group.split(".").slice(1).join(".")}
                  </code>
                  <span className={styles.count}>{rows.length} tokens</span>
                </h3>
                <DataTable
                  caption={`${group} tokens`}
                  head={["Token", "Light", "Dark"]}
                  rows={rows.map((t) => [
                    <span key="n" className={styles.token}>
                      {t.type === "color" ? <Swatch token={t.name} /> : null}
                      <InlineCode>{t.cssName}</InlineCode>
                    </span>,
                    <InlineCode key="l">{exampleValues(t).light ?? "—"}</InlineCode>,
                    <InlineCode key="d">{exampleValues(t).dark ?? "—"}</InlineCode>,
                  ])}
                />
              </div>
            );
          })}
        </Sheet>
      ))}
    </DocsLayout>
  );
}
