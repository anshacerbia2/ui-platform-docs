import type { ApiExport } from "@/shared/lib/reference";
import { DarkRoot } from "@/shared/ui/DarkRoot";
import { Code, SubHeading, Table } from "./Section";
import styles from "./reference.module.scss";

function Props({ item }: { item: ApiExport }) {
  const props = item.props ?? [];
  return (
    <div className={styles.apiItem}>
      <SubHeading>
        <Code>{item.name}</Code>
      </SubHeading>
      {item.description ? (
        <p className={styles.lead}>{item.description.split("\n\n")[0]?.replace(/\n/g, " ")}</p>
      ) : null}
      {props.length ? (
        <Table
          caption={`Props of ${item.name}`}
          head={["Prop", "Type", "Default", "Description"]}
          rows={props.map((p) => [
            <span key="n" className={styles.propName}>
              <Code>{p.name}</Code>
              {p.optional ? null : <span className={styles.required}>required</span>}
              {p.deprecated ? <span className={styles.deprecated}>deprecated</span> : null}
            </span>,
            <Code key="t">{p.type}</Code>,
            p.default ? <Code key="d">{p.default}</Code> : "—",
            <span key="x" className={styles.propText}>
              {p.description.replace(/\n/g, " ") || "—"}
              {p.modes && item.modes ? (
                <span className={styles.mode}>
                  In {p.modes} of {item.modes} prop shapes.
                </span>
              ) : null}
            </span>,
          ])}
        />
      ) : (
        <p className={styles.lead}>No props of its own.</p>
      )}
      {item.extendsNative ? (
        <p className={styles.note}>
          Also accepts the attributes of the element it renders, typed by React for that element.
        </p>
      ) : null}
      {item.parts?.length ? (
        <div className={styles.parts}>
          {item.parts.map((part) => (
            <Props key={part.name} item={part} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The public API of one entry, read from its published declarations. */
export function Api({ entry, api }: { entry: string; api: ApiExport[] }) {
  const components = api.filter((a) => a.kind === "component");
  const others = api.filter((a) => a.kind !== "component");
  return (
    <>
      <DarkRoot>
        <pre className={styles.import}>
          <code>{`import { ${components.map((c) => c.name).join(", ") || others[0]?.name} } from "${entry}";`}</code>
        </pre>
      </DarkRoot>
      {components.map((c) => (
        <Props key={c.name} item={c} />
      ))}
      {others.length ? (
        <>
          <SubHeading>Exported types and functions</SubHeading>
          <Table
            caption="Other exports"
            head={["Export", "Kind", "Definition"]}
            rows={others.map((o) => [
              <Code key="n">{o.name}</Code>,
              o.kind,
              <Code key="d">{o.type ?? o.signature ?? "—"}</Code>,
            ])}
          />
        </>
      ) : null}
    </>
  );
}
