import type { TextTag } from "@scnx/core-ui/components/text-base";
import { Text as SystemText, type TextProps } from "@scnx/system/components/text";

export type { TextProps, TextTag };

/** The design system's Text, as the docs use it in informative content. */
export function Text<T extends TextTag = "p">(props: TextProps<T>) {
  return <SystemText<T> {...props} />;
}
