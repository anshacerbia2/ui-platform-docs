import type { Route } from "next";
import { Facts } from "@/components/docs/Facts";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { titleOf, type EntryRow, type PrimitiveReference } from "@/shared/lib/reference";
import { Accessibility } from "./Accessibility";
import { Api } from "./Api";
import { Status } from "./Status";

const SECTIONS = [
  { id: "accessibility", title: "Behavior and accessibility" },
  { id: "api", title: "API" },
  { id: "status", title: "Status" },
];

const firstParagraph = (text?: string) => text?.split("\n\n")[0]?.replace(/\n/g, " ");

/** A Primitives page (ADR-UIP-CMP-001 item 9), generated from the primitive specification. */
export function PrimitivePage({
  row,
  reference,
}: {
  row: EntryRow;
  reference: PrimitiveReference;
}) {
  const main = reference.api.find((a) => a.kind === "component");
  const { spec } = reference;
  return (
    <DocsLayout toc={SECTIONS}>
      <PageHead
        crumbs={[
          { label: "Primitives", href: "/primitives" as Route },
          { label: titleOf(row.slug) },
        ]}
        title={spec.name}
        lead={firstParagraph(main?.description)}
      />
      <Facts
        label="Primitive"
        items={[
          { term: "Lifecycle", value: row.stability },
          { term: "Styles", value: "none, headless" },
          { term: "Root", value: `<${spec.root}>` },
          { term: "Keys", value: String(spec.keys.length) },
          {
            term: "Styled by",
            value: reference.styledBy.map(titleOf).join(", ") || "no component",
          },
        ]}
      />
      <Sheet
        id="accessibility"
        title="Behavior and accessibility"
        meta={[{ term: "Generated from", value: `${row.package}/specs/${row.slug}.json` }]}
      >
        <Accessibility spec={spec} />
      </Sheet>
      <Sheet
        id="api"
        title="API"
        meta={[{ term: "Read from", value: "the published declarations" }]}
      >
        <Api entry={spec.entry} api={reference.api} />
      </Sheet>
      <Sheet id="status" title="Status">
        <Status row={row} />
      </Sheet>
    </DocsLayout>
  );
}
