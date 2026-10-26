"use client";

import { useTheme, type ThemeMode } from "@/components/system/Theme";
import { Monitor, Moon, Sun } from "@/components/docs/Icons";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import styles from "./ModeSwitch.module.scss";

const MODES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light mode", Icon: Sun },
  { mode: "dark", label: "Dark mode", Icon: Moon },
  { mode: "system", label: "Match the system", Icon: Monitor },
];

/** Light, dark, or system: three toggle buttons, one pressed. The page switches with no transition. */
export function ModeSwitch() {
  const { mode, setMode } = useTheme();
  return (
    <div role="group" aria-label="Color mode" className={styles.group}>
      {MODES.map(({ mode: value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={styles.button}
          aria-pressed={mode === value}
          aria-label={label}
          title={label}
          onClick={() => withoutTransitions(() => setMode(value))}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
