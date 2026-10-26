import { Button as SystemButton, type ButtonProps } from "@scnx/system/components/button";

export type { ButtonProps };

/**
 * The design system's Button, as the docs use it inside a specimen or a theme root.
 * The docs chrome's own calls to action are `Cta`, not this component.
 */
export function Button(props: ButtonProps) {
  return <SystemButton {...props} />;
}
