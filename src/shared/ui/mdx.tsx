import type { MDXComponents } from "mdx/types";
import { Heading } from "@scnx/system/components/heading";
import { Text } from "@scnx/system/components/text";
import { CodeBlock } from "./CodeBlock";
import styles from "./mdx.module.scss";

/** Informative MDX renders with the system's own Heading and Text (TDD docs-site D3). */
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
  a: ({ href, children }) => (
    <a href={href} className={styles.link}>
      {children}
    </a>
  ),
  code: ({ children }) => <code className={styles.code}>{children}</code>,
  pre: ({ children }) => {
    const code = (children as { props?: { children?: string } })?.props?.children ?? "";
    return <CodeBlock code={String(code)} />;
  },
};
