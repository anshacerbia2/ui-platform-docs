import { Kbd as SystemKbd, type KbdProps } from "@scnx/system/components/kbd";

export type { KbdProps };

/** The design system's Kbd, as the docs use it: one key as a keycap; a chord is several. */
export function Kbd(props: KbdProps) {
  return <SystemKbd {...props} />;
}
