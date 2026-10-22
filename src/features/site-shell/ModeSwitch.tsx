"use client";

import { useTheme, type ThemeMode } from "@scnx/core-ui/providers/theme-provider-base";
import { Monitor, Moon, Sun } from "@/shared/ui/icons";
import styles from "./ModeSwitch.module.scss";

const MODES: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light mode", Icon: Sun },
  { mode: "dark", label: "Dark mode", Icon: Moon },
  { mode: "system", label: "Match the system", Icon: Monitor },
];

/** Light, dark, or system: three toggle buttons, one pressed. */
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
          onClick={() => setMode(value)}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
