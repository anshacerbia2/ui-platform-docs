import { PageHead } from "@/components/docs/PageHead";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";

// App Router sends the root not-found page with every page's payload, so it carries no
// sidebar: its lead links to the areas instead.
export default function NotFound() {
  return (
    <DocsLayout sidebar={false}>
      <PageHead
        title="Page not found"
        lead={
          <>
            This page does not exist in the documented release. Browse the{" "}
            <TextLink href="/components">components</TextLink> or{" "}
            <TextLink href="/primitives">primitives</TextLink>.
          </>
        }
      />
    </DocsLayout>
  );
}
