import { Badge as SystemBadge, type BadgeProps } from "@scnx/system/components/badge";

export type { BadgeProps };

/** The design system's Badge, as the docs use it: a short status or count label. */
export function Badge(props: BadgeProps) {
  return <SystemBadge {...props} />;
}
