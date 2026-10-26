import { Block } from "@/components/docs/Block";
import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import { Swatch } from "@/components/docs/Swatch";
import { tokensIn } from "@/shared/lib/bindings";
import type { ComponentReference, ContrastRow } from "@/shared/lib/reference";
import styles from "./Reference.module.scss";

const conditions = (option?: Record<string, string>, state?: string) => {
  const parts = [
    ...Object.entries(option ?? {}).map(([k, v]) => `${k}=${v}`),
    ...(state ? [state] : []),
  ];
  return parts.length ? parts.join(" · ") : "always";
};

/** A declared value: a swatch for each colour token it names, then the value itself. */
function Value({ value }: { value: string }) {
  return (
    <span className={styles.value}>
      {tokensIn(value)
        .filter((t) => t.startsWith("color."))
        .map((t) => (
          <Swatch key={t} token={t} />
        ))}
      <InlineCode>{value.replace(/\{([a-z0-9.-]+)\}/g, "$1")}</InlineCode>
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

/** Anatomy, options, states and bindings, as the styled specification publishes them. */
export function Specification({ reference }: { reference: ComponentReference }) {
  const { spec } = reference;
  return (
    <>
      <Block title="Anatomy" />
      <DataTable
        caption="Parts"
        head={["Part", "Selector", "Primitive part", "Refines"]}
        rows={spec.anatomy.map((p) => [
          <InlineCode key="n">{p.name}</InlineCode>,
          <InlineCode key="s">{p.selector}</InlineCode>,
          p.primitivePart ? <InlineCode key="p">{p.primitivePart}</InlineCode> : "—",
          p.extends ? <InlineCode key="e">{p.extends}</InlineCode> : "—",
        ])}
      />
      {Object.keys(spec.options).length > 0 ? (
        <>
          <Block title="Options" />
          <DataTable
            caption="Options"
            head={["Option", "Values", "Default", "Selector"]}
            rows={Object.entries(spec.options).map(([name, o]) => [
              <InlineCode key="n">{name}</InlineCode>,
              o.values.join(" · "),
              o.default ? <InlineCode key="d">{o.default}</InlineCode> : "none",
              <InlineCode key="s">{o.selector}</InlineCode>,
            ])}
          />
        </>
      ) : null}
      {spec.states.length > 0 ? (
        <>
          <Block title="States" />
          <DataTable
            caption="States"
            head={["State", "Selectors", "Entered by", "Attaches to"]}
            rows={spec.states.map((s) => [
              <InlineCode key="n">{s.name}</InlineCode>,
              <InlineCode key="s">{s.selectors.join(", ")}</InlineCode>,
              enteredBy(s.enter),
              s.on ?? "the part",
            ])}
          />
        </>
      ) : null}
      <Block title="Bindings">
        <p>
          Every token-bearing declaration of the published stylesheet, by part, option, and state. A
          literal value overrides a property the part binds to a token elsewhere.
        </p>
      </Block>
      <DataTable
        caption="Bindings"
        head={["Part", "When", "Property", "Value"]}
        rows={spec.bindings.flatMap((b) =>
          Object.entries(b.declarations).map(([property, value], i) => [
            i === 0 ? <InlineCode key="p">{b.part}</InlineCode> : "",
            i === 0 ? conditions(b.option, b.state) : "",
            <InlineCode key="pr">{property}</InlineCode>,
            <Value key="v" value={value} />,
          ]),
        )}
      />
    </>
  );
}

/** Each pair a part renders, with its lowest WCAG 2.2 ratio per theme and mode. */
export function ContrastTable({ rows }: { rows: ContrastRow[] }) {
  if (rows.length === 0)
    return (
      <Block>
        <p>
          No part of this component binds both a text color and a background, so it renders no
          contrast pair of its own.
        </p>
      </Block>
    );
  const columns = rows[0]!.results.map((r) => `${r.theme} ${r.mode}`);
  return (
    <DataTable
      caption="Contrast of each rendered pair"
      head={["Part", "When", "Text on background", ...columns]}
      rows={rows.map((row) => [
        <InlineCode key="p">{row.part}</InlineCode>,
        conditions(row.option, row.state === "rest" ? undefined : row.state),
        <span key="t" className={styles.value}>
          <Swatch token={row.fg} />
          <Swatch token={row.bg} />
          <InlineCode>{row.fg.replace(/^color\./, "")}</InlineCode> on{" "}
          <InlineCode>{row.bg.replace(/^color\./, "")}</InlineCode>
        </span>,
        ...row.results.map((r) => (
          <span
            key={`${r.theme}${r.mode}`}
            className={styles.ratio}
            data-pass={r.pass || undefined}
            title={`lowest on ${r.path}`}
          >
            {r.ratio.toFixed(2)}
            <span className={styles.verdict}>{r.pass ? "AA" : "fail"}</span>
          </span>
        )),
      ])}
    />
  );
}
