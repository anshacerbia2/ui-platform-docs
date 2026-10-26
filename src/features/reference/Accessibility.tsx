import type { Route } from "next";
import Link from "next/link";
import { Block } from "@/components/docs/Block";
import { DataTable } from "@/components/docs/DataTable";
import { FactGrid } from "@/components/docs/FactGrid";
import { InlineCode } from "@/components/docs/InlineCode";
import { Keys } from "@/components/docs/Keys";
import type { PrimitiveSpec } from "@/shared/lib/reference";
import styles from "./Reference.module.scss";

const codes = (values: string[]) => values.map((v) => <InlineCode key={v}>{v}</InlineCode>);

/** The behavior contract of a primitive; every key row is verified in Chromium, Firefox, and WebKit. */
export function Accessibility({ spec, inherited }: { spec: PrimitiveSpec; inherited?: boolean }) {
  const slug = spec.entry.split("/").pop()!;
  const facts = [
    { term: "Root element", value: <InlineCode>{`<${spec.root}>`}</InlineCode> },
    { term: "Accessible name", value: spec.accessibleName },
    { term: "Initial focus", value: spec.focus.initial },
    { term: "Focus movement", value: spec.focus.movement },
    { term: "Focus restoration", value: spec.focus.restoration },
    { term: "States", value: spec.states.join(" · ") },
    ...(spec.controlledProps.length
      ? [{ term: "Controlled props", value: codes(spec.controlledProps) }]
      : []),
    ...(spec.dataHooks.length ? [{ term: "Data hooks", value: codes(spec.dataHooks) }] : []),
  ];
  return (
    <>
      {inherited ? (
        <Block>
          <p>
            This component styles{" "}
            <Link href={`/primitives/${slug}` as Route} className={styles.link}>
              {spec.name}
            </Link>{" "}
            (<InlineCode>{spec.entry}</InlineCode>) and inherits its contract unchanged.
          </p>
        </Block>
      ) : null}
      <FactGrid label="Behavior contract" items={facts} />
      {spec.keys.length ? (
        <>
          <Block title="Keyboard" />
          <DataTable
            caption="Keyboard contract"
            head={["Key", "On", "When", "Result"]}
            rows={spec.keys.map((k) => [
              <Keys key="k" value={k.key} />,
              <InlineCode key="p">{k.part}</InlineCode>,
              k.condition,
              k.effect,
            ])}
          />
        </>
      ) : null}
      <Block title="Parts" />
      <DataTable
        caption="Primitive parts"
        head={["Part", "Element"]}
        rows={spec.parts.map((p) => [
          <InlineCode key="n">{p.name}</InlineCode>,
          <InlineCode key="e">{`<${p.element}>`}</InlineCode>,
        ])}
      />
    </>
  );
}
