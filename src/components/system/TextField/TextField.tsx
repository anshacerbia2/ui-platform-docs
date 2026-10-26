"use client";

import {
  TextField as SystemTextField,
  type TextFieldProps,
} from "@scnx/system/components/text-field";

export type { TextFieldProps };

/** The design system's TextField, as the docs use it inside a specimen. */
export function TextField(props: TextFieldProps) {
  return <SystemTextField {...props} />;
}
