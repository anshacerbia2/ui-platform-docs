import { Block } from "@/components/docs/Block";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DataTable } from "@/components/docs/DataTable";
import { InlineCode } from "@/components/docs/InlineCode";
import type { ApiExport } from "@/shared/lib/reference";
import styles from "./Reference.module.scss";

const firstParagraph = (text: string) => text.split("\n\n")[0]?.replace(/\n/g, " ");

function Props({ item }: { item: ApiExport }) {
  const props = item.props ?? [];
  return (
    <>
      <Block title={item.name}>
        {item.description ? <p>{firstParagraph(item.description)}</p> : null}
        {props.length ? null : <p>No props of its own.</p>}
        {item.extendsNative ? (
          <p>
            Also accepts the attributes of the element it renders, typed by React for that element.
          </p>
        ) : null}
      </Block>
      {props.length ? (
        <DataTable
          caption={`Props of ${item.name}`}
          head={["Prop", "Type", "Default", "Description"]}
          rows={props.map((p) => [
            <span key="n" className={styles.propName}>
              <InlineCode>{p.name}</InlineCode>
              {p.optional ? null : <span className={styles.required}>required</span>}
              {p.deprecated ? <span className={styles.deprecated}>deprecated</span> : null}
            </span>,
            <InlineCode key="t">{p.type}</InlineCode>,
            p.default ? <InlineCode key="d">{p.default}</InlineCode> : "—",
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
      ) : null}
      {item.parts?.map((part) => (
        <Props key={part.name} item={part} />
      ))}
    </>
  );
}

/** The public API of one entry, read from its published declarations. */
export function Api({ entry, api }: { entry: string; api: ApiExport[] }) {
  const components = api.filter((a) => a.kind === "component");
  const others = api.filter((a) => a.kind !== "component");
  const names = components.map((c) => c.name).join(", ") || others[0]?.name;
  return (
    <>
      <Block>
        <CodeBlock code={`import { ${names} } from "${entry}";`} title="import" numbered={false} />
      </Block>
      {components.map((c) => (
        <Props key={c.name} item={c} />
      ))}
      {others.length ? (
        <>
          <Block title="Exported types and functions" />
          <DataTable
            caption="Other exports"
            head={["Export", "Kind", "Definition"]}
            rows={others.map((o) => [
              <InlineCode key="n">{o.name}</InlineCode>,
              o.kind,
              <InlineCode key="d">{o.type ?? o.signature ?? "—"}</InlineCode>,
            ])}
          />
        </>
      ) : null}
    </>
  );
}
