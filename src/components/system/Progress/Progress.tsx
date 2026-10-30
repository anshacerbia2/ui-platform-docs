import { Progress as SystemProgress, type ProgressProps } from "@scnx/system/components/progress";

export type { ProgressProps };

/** The design system's Progress, as the docs use it inside a specimen: a labelled known quantity. */
export function Progress(props: ProgressProps) {
  return <SystemProgress {...props} />;
}
