import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/docs/Mdx";

/** The elements MDX content renders with (Next.js convention file). */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
