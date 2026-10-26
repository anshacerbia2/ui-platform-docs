import { PageHead } from "@/components/docs/PageHead";
import { TextLink } from "@/components/docs/TextLink";
import { DocsLayout } from "@/components/shell/DocsLayout";

export default function NotFound() {
  return (
    <DocsLayout>
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
