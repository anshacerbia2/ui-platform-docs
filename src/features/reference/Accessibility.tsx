import Link from "next/link";
import type { Route } from "next";
import type { PrimitiveSpec } from "@/shared/lib/reference";
import { Code, SubHeading, Table } from "./Section";
import styles from "./reference.module.scss";

const Keys = ({ value }: { value: string }) => (
  <span className={styles.keys}>
    {value.split("+").map((k) => (
      <kbd key={k} className={styles.kbd}>
        {k}
      </kbd>
    ))}
  </span>
);

/** The behavior contract of a primitive; every key row is verified in Chromium, Firefox, and WebKit. */
export function Accessibility({ spec, inherited }: { spec: PrimitiveSpec; inherited?: boolean }) {
  const slug = spec.entry.split("/").pop()!;
  return (
    <>
      {inherited ? (
        <p className={styles.lead}>
          This component styles{" "}
          <Link href={`/primitives/${slug}` as Route} className={styles.link}>
            {spec.name}
          </Link>{" "}
          (<Code>{spec.entry}</Code>) and inherits its contract unchanged.
        </p>
      ) : null}
      <dl className={styles.facts}>
        <div>
          <dt>Root element</dt>
          <dd>
            <Code>&lt;{spec.root}&gt;</Code>
          </dd>
        </div>
        <div>
          <dt>Accessible name</dt>
          <dd>{spec.accessibleName}</dd>
        </div>
        <div>
          <dt>Initial focus</dt>
          <dd>{spec.focus.initial}</dd>
        </div>
        <div>
          <dt>Focus movement</dt>
          <dd>{spec.focus.movement}</dd>
        </div>
        <div>
          <dt>Focus restoration</dt>
          <dd>{spec.focus.restoration}</dd>
        </div>
        <div>
          <dt>States</dt>
          <dd>{spec.states.join(" · ")}</dd>
        </div>
        {spec.controlledProps.length ? (
          <div>
            <dt>Controlled props</dt>
            <dd>
              {spec.controlledProps.map((p) => (
                <Code key={p}>{p}</Code>
              ))}
            </dd>
          </div>
        ) : null}
        {spec.dataHooks.length ? (
          <div>
            <dt>Data hooks</dt>
            <dd>
              {spec.dataHooks.map((p) => (
                <Code key={p}>{p}</Code>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
      {spec.keys.length ? (
        <>
          <SubHeading>Keyboard</SubHeading>
          <Table
            caption="Keyboard contract"
            head={["Key", "On", "When", "Result"]}
            rows={spec.keys.map((k) => [
              <Keys key="k" value={k.key} />,
              <Code key="p">{k.part}</Code>,
              k.condition,
              k.effect,
            ])}
          />
        </>
      ) : null}
      <SubHeading>Parts</SubHeading>
      <Table
        caption="Primitive parts"
        head={["Part", "Element"]}
        rows={spec.parts.map((p) => [
          <Code key="n">{p.name}</Code>,
          <Code key="e">&lt;{p.element}&gt;</Code>,
        ])}
      />
    </>
  );
}
