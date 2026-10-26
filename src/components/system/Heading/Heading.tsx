import {
  Heading as SystemHeading,
  type HeadingProps,
  type HeadingTag,
} from "@scnx/system/components/heading";

export type { HeadingProps, HeadingTag };

/** The design system's Heading, as the docs use it in informative content. */
export function Heading<T extends HeadingTag = "h2">(props: HeadingProps<T>) {
  return <SystemHeading<T> {...props} />;
}
