import type { Metadata } from "next";
import Link from "next/link";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { PageToc } from "@/features/reference/PageToc";
import { Code, Section, Table } from "@/features/reference/Section";
import styles from "@/features/reference/reference.module.scss";
import { tokenList, tokenThemes } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";

export const metadata: Metadata = { title: "Tokens" };

const GROUPS = [...new Set(tokenList.map((t) => t.name.split(".").slice(0, 2).join(".")))];
const idOf = (group: string) => group.replaceAll(".", "-");

export default function Page() {
  const themes = Object.keys(tokenThemes);
  const standard = tokenThemes[themes[0] ?? SITE_THEME]?.standard;
  return (
    <DocsLayout aside={<PageToc items={GROUPS.map((g) => ({ id: idOf(g), title: g }))} />}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tokens</h1>
        <p className={styles.lead}>
          {tokenList.length} canonical tokens in {themes.length} themes, each in light and dark,
          generated from the published JSON. Names follow {standard?.id} {standard?.version}:
          scheme, role, emphasis, and state. Use the CSS custom property; a value may change in a
          minor release, a name may not. Designers get the same tokens in Figma from the build: see{" "}
          <Link className={styles.link} href="/tokens/figma">
            Tokens in Figma
          </Link>
          .
        </p>
      </header>
      {GROUPS.map((group) => {
        const rows = tokenList.filter((t) => t.name.startsWith(`${group}.`));
        return (
          <Section key={group} id={idOf(group)} title={group} source={`${rows.length} tokens`}>
            <Table
              caption={`${group} tokens`}
              head={["Token", ...themes.flatMap((t) => [`${t} light`, `${t} dark`])]}
              rows={rows.map((t) => [
                <span key="n" className={styles.value}>
                  {t.type === "color" ? <span className={styles.dot} data-swatch={t.name} /> : null}
                  <Code>{t.cssName}</Code>
                </span>,
                ...themes.flatMap((id) => [
                  <Code key={`${id}l`}>{t.values[id]?.light ?? "—"}</Code>,
                  <Code key={`${id}d`}>{t.values[id]?.dark ?? "—"}</Code>,
                ]),
              ])}
            />
          </Section>
        );
      })}
    </DocsLayout>
  );
}
