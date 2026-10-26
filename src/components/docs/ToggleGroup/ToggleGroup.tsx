"use client";

import styles from "./ToggleGroup.module.scss";

type Option<T extends string> = { value: T; label?: string };

type ToggleGroupProps<T extends string> = {
  /** The group's accessible name: "Theme", "Mode". */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "small" | "medium";
};

/**
 * A row of toggle buttons, one pressed (the docs' own control: the system ships no
 * segmented control yet). Square, on the drawing's lines; the pressed button is a
 * raised cell.
 */
export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  size = "medium",
}: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group} data-size={size}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label ?? option.value}
        </button>
      ))}
    </div>
  );
}
