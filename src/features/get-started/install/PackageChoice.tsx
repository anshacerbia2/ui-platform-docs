"use client";

import { useState } from "react";
import { Dim } from "@/components/docs/Dim";
import { Badge } from "@/components/system/Badge";
import styles from "./Install.module.scss";

const OPTIONS = [
  {
    value: "core",
    title: "I bring my own styling",
    text: "Headless behavior, keyboard, focus and ARIA. No CSS, no tokens.",
    packages: "@scnx/core-ui",
  },
  {
    value: "system",
    title: "I want the Scnehaux look",
    text: "Styled components, themes, tokens and fonts. Installs core-ui as a peer.",
    packages: "@scnx/system + @scnx/core-ui",
    tag: "Most teams",
  },
] as const;

/** Which package do I need: two radios, and the one direction of dependency between them. */
export function PackageChoice() {
  const [choice, setChoice] = useState<string>("system");
  return (
    <fieldset className={styles.choose}>
      <legend className="u-visually-hidden">Which package do I need?</legend>
      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className={styles.option}
          data-checked={choice === option.value || undefined}
        >
          <input
            type="radio"
            name="package"
            value={option.value}
            checked={choice === option.value}
            onChange={() => setChoice(option.value)}
          />
          <strong>
            {option.title}
            {"tag" in option ? <Badge size="small">{option.tag}</Badge> : null}
          </strong>
          <p>{option.text}</p>
          <code>{option.packages}</code>
        </label>
      ))}
      <div
        className={styles.deps}
        aria-label="core-ui is a peer of system, which your app installs"
      >
        <span className={styles.pkg}>core-ui</span>
        <Dim>peer</Dim>
        <span className={styles.pkg}>system</span>
        <Dim>install</Dim>
        <span className={styles.pkg}>your app</span>
      </div>
    </fieldset>
  );
}
