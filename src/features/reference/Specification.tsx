import type { ComponentReference, ContrastRow } from "@/shared/lib/reference";
import { tokensIn } from "@/shared/lib/bindings";
import { Code, SubHeading, Table } from "./Section";
import styles from "./reference.module.scss";

const conditions = (option?: Record<string, string>, state?: string) => {
  const parts = [...Object.entries(option ?? {}).map(([k, v]) => `${k}=${v}`), ...(state ? [state] : [])];
  return parts.length ? parts.join(" · ") : "always";
};

function Value({ value }: { value: string }) {
  const tokens = tokensIn(value);
  return (
    <span className={styles.value}>
      {tokens
        .filter((t) => t.startsWith("color."))
        .map((t) => (
          <span key={t} className={styles.dot} data-swatch={t} />
        ))}
      <Code>{value.replace(/\{([a-z0-9.-]+)\}/g, "$1")}</Code>
    </span>
  );
}

const enteredBy = (enter: Record<string, unknown>) =>
  "props" in enter
    ? `props ${JSON.stringify(enter.props)}`
    : "interaction" in enter
      ? `${String(enter.interaction)} interaction`
      : "attribute" in enter
        ? `attribute ${JSON.stringify(enter.attribute)}`
        : "rendered by the fixture";

export function Specification({ reference }: { reference: ComponentReference }) {
  const { spec } = reference;
  return (
    <>
      <SubHeading>Anatomy</SubHeading>
      <Table
        caption="Parts"
        head={["Part", "Selector", "Primitive part", "Refines"]}
        rows={spec.anatomy.map((p) => [
          <Code key="n">{p.name}</Code>,
          <Code key="s">{p.selector}</Code>,
          p.primitivePart ? <Code key="p">{p.primitivePart}</Code> : "—",
          p.extends ? <Code key="e">{p.extends}</Code> : "—",
        ])}
      />
      {Object.keys(spec.options).length > 0 ? (
        <>
          <SubHeading>Options</SubHeading>
          <Table
            caption="Options"
            head={["Option", "Values", "Default", "Selector"]}
            rows={Object.entries(spec.options).map(([name, o]) => [
              <Code key="n">{name}</Code>,
              o.values.join(" · "),
              o.default ? <Code key="d">{o.default}</Code> : "none",
              <Code key="s">{o.selector}</Code>,
            ])}
          />
        </>
      ) : null}
      {spec.states.length > 0 ? (
        <>
          <SubHeading>States</SubHeading>
          <Table
            caption="States"
            head={["State", "Selectors", "Entered by", "Attaches to"]}
            rows={spec.states.map((s) => [
              <Code key="n">{s.name}</Code>,
              <Code key="s">{s.selectors.join(", ")}</Code>,
              enteredBy(s.enter),
              s.on ?? "the part",
            ])}
          />
        </>
      ) : null}
      <SubHeading>Bindings</SubHeading>
      <p className={styles.lead}>
        Every token-bearing declaration of the published stylesheet, by part, option, and state. A literal value overrides a property the part binds to a token
        elsewhere.
      </p>
      <Table
        caption="Bindings"
        head={["Part", "When", "Property", "Value"]}
        rows={spec.bindings.flatMap((b) =>
          Object.entries(b.declarations).map(([property, value], i) => [
            i === 0 ? <Code key="p">{b.part}</Code> : "",
            i === 0 ? conditions(b.option, b.state) : "",
            <Code key="pr">{property}</Code>,
            <Value key="v" value={value} />,
          ]),
        )}
      />
    </>
  );
}

export function ContrastTable({ rows }: { rows: ContrastRow[] }) {
  if (rows.length === 0)
    return <p className={styles.lead}>No part of this component binds both a text color and a background, so it renders no contrast pair of its own.</p>;
  const columns = rows[0]!.results.map((r) => `${r.theme} ${r.mode}`);
  return (
    <Table
      caption="Contrast of each rendered pair"
      head={["Part", "When", "Text on background", ...columns]}
      rows={rows.map((row) => [
        <Code key="p">{row.part}</Code>,
        conditions(row.option, row.state === "rest" ? undefined : row.state),
        <span key="t" className={styles.pair}>
          <span className={styles.dot} data-swatch={row.fg} />
          <span className={styles.dot} data-swatch={row.bg} />
          <Code>{row.fg.replace(/^color\./, "")}</Code> on <Code>{row.bg.replace(/^color\./, "")}</Code>
        </span>,
        ...row.results.map((r) => (
          <span key={`${r.theme}${r.mode}`} className={styles.ratio} data-pass={r.pass || undefined} title={`lowest on ${r.path}`}>
            {r.ratio.toFixed(2)}
            <span className={styles.verdict}>{r.pass ? "AA" : "fail"}</span>
          </span>
        )),
      ])}
    />
  );
}
