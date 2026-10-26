import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { InlineCode } from "@/components/docs/InlineCode";
import { TextLink } from "@/components/docs/TextLink";
import { Heading } from "@/components/system/Heading";
import { Text } from "@/components/system/Text";
import styles from "./mdx.module.scss";

type Fence = { props?: { children?: string; className?: string } };

/**
 * Informative MDX renders with the system's own Heading and Text (TDD docs-site D3),
 * and the docs' code block, inline code and links.
 */
export const mdxComponents: MDXComponents = {
  h2: ({ children, id }) => (
    <Heading as="h3" size="small" id={id} className={styles.h2}>
      {children}
    </Heading>
  ),
  h3: ({ children, id }) => (
    <Heading as="h4" size="xsmall" id={id} className={styles.h3}>
      {children}
    </Heading>
  ),
  p: ({ children }) => (
    <Text as="p" variant="body-default" className={styles.p}>
      {children}
    </Text>
  ),
  ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
  a: ({ href, children }) => <TextLink href={href ?? "#"}>{children}</TextLink>,
  code: ({ children }) => <InlineCode>{children}</InlineCode>,
  pre: ({ children }) => {
    const fence = (children as Fence)?.props;
    // a fence's language (```tsx) names the block
    const language = /language-(\w+)/.exec(fence?.className ?? "")?.[1];
    return <CodeBlock code={String(fence?.children ?? "")} title={language} language={language} />;
  },
};
