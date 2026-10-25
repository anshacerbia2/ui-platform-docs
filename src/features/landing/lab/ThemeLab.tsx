"use client";

import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { Button } from "@scnx/system/components/button";
import { Tabs } from "@scnx/system/components/tabs";
import { TextField } from "@scnx/system/components/text-field";
import { useState } from "react";
import type { Lab } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";
import styles from "./ThemeLab.module.scss";

function Swatch({ token }: { token: string }) {
  return <span className={styles.swatch} title={token} data-swatch={token} />;
}

/** Real components in a real theme root; the checks are the gate's numbers for that root. */
export function ThemeLab({ lab, swatches }: { lab: Lab; swatches: string[] }) {
  const themes = Object.keys(lab);
  const [theme, setTheme] = useState(themes[0] ?? SITE_THEME);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const checks = lab[theme]?.[mode] ?? [];
  return (
    <div className={styles.lab}>
      <div className={styles.toolbar}>
        <div role="group" aria-label="Theme" className={styles.segment}>
          {themes.map((id) => (
            <button key={id} type="button" aria-pressed={theme === id} onClick={() => setTheme(id)}>
              {id}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Mode" className={styles.segment}>
          {(["light", "dark"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.body}>
        <ThemeProvider themeId={theme} mode={mode} storage={false}>
          <div className={styles.canvas}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-label="Sample form">
              <div className={styles.formHead}>
                <span className={styles.formTitle}>Invite teammate</span>
                <span className={styles.badge}>Admin seat</span>
              </div>
              <Tabs defaultValue="members">
                <Tabs.List aria-label="Invite">
                  <Tabs.Tab value="members">Members</Tabs.Tab>
                  <Tabs.Tab value="roles">Roles</Tabs.Tab>
                  <Tabs.Tab value="audit">Audit</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="members">
                  <TextField label="Work email" type="email" defaultValue="ayu@northwind.co" description="They will get access to 3 workspaces." />
                </Tabs.Panel>
                <Tabs.Panel value="roles">Roles are granted after the invite is accepted.</Tabs.Panel>
                <Tabs.Panel value="audit">Every invite is recorded in the audit log.</Tabs.Panel>
              </Tabs>
              <div className={styles.formActions}>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Send invite
                </Button>
              </div>
            </form>
          </div>
          <div className={styles.ramp} aria-label="Primary scheme roles in this root">
            {swatches.map((token) => (
              <Swatch key={token} token={token} />
            ))}
          </div>
        </ThemeProvider>
        <ul className={styles.checks} aria-label={`Contrast in ${theme}, ${mode} mode`}>
          {checks.map((c) => (
            <li key={c.label} className={styles.check}>
              <span>{c.label}</span>
              <span className={styles.ratio}>
                {c.ratio.toFixed(1)} : 1
                <span className={styles.verdict} data-pass={c.pass || undefined}>
                  {c.pass ? (c.minimum >= 4.5 ? "AA" : "3:1") : "Fail"}
                </span>
              </span>
            </li>
          ))}
          <li className={styles.checkNote}>WCAG 2.2, lowest ratio over sRGB and Display P3 · computed by the token gate&apos;s method</li>
        </ul>
      </div>
    </div>
  );
}
