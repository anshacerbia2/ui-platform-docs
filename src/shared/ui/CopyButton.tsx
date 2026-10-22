"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "./icons";
import styles from "./CopyButton.module.scss";

/** Copies `value` to the clipboard and announces the result politely. */
export function CopyButton({ value, label }: { value: string; label: string }) {
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
    <button type="button" className={styles.button} onClick={copy} aria-label={label}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span className="u-visually-hidden" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
