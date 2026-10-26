import { Badge, type BadgeProps } from "@/components/system/Badge";

const SCHEME: Record<string, BadgeProps["scheme"]> = {
  stable: "success",
  candidate: "neutral",
  experimental: "warning",
  deprecated: "danger",
};

/** An entry's lifecycle, as the system's Badge: the word carries it, the scheme repeats it. */
export function StabilityBadge({ stability }: { stability: string }) {
  return (
    <Badge scheme={SCHEME[stability] ?? "neutral"} size="small">
      {stability.charAt(0).toUpperCase() + stability.slice(1)}
    </Badge>
  );
}
