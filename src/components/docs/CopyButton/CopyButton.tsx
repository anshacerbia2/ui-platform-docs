"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@/components/docs/Icons";
import styles from "./CopyButton.module.scss";

type CopyButtonProps = {
  value: string;
  label: string;
  /** `cell`: a 48px cell of a line drawing, its left line its only edge (an install line). */
  variant?: "plain" | "cell";
};

/** Copies `value` to the clipboard and announces the result politely. */
export function CopyButton({ value, label, variant = "plain" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      className={styles.button}
      data-variant={variant}
      onClick={copy}
      aria-label={label}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      <span className="u-visually-hidden" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
