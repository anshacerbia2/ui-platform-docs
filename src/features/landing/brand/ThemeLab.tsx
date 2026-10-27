"use client";

import { useState } from "react";
import { Cells } from "@/components/docs/Cells";
import { Panel } from "@/components/docs/Panel";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
import { Body, Title } from "@/components/docs/Type";
import { Badge } from "@/components/system/Badge";
import { Button } from "@/components/system/Button";
import { Tabs } from "@/components/system/Tabs";
import { TextField } from "@/components/system/TextField";
import { ThemeRoot, useTheme } from "@/components/system/Theme";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import type { Lab } from "@/shared/lib/reference";
import { SITE_THEME } from "@/shared/lib/themes";
import styles from "./ThemeLab.module.scss";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

/**
 * Sheet 03's two cells: pick a published theme and a mode; the form is the real
 * Tabs, TextField and Button inside a real theme root, and the pairs are the token
 * gate's numbers for that root (TDD docs-site D3, D8). The mode follows the page's
 * own until the reader picks one, so the lab opens in the mode the reader is in.
 */
export function ThemeLab({ lab, swatches }: { lab: Lab; swatches: string[] }) {
  const themes = Object.keys(lab);
  const page = useTheme();
  const [theme, setTheme] = useState(themes[0] ?? SITE_THEME);
  const [picked, setMode] = useState<"light" | "dark" | null>(null);
  const mode = picked ?? page.resolvedMode;
  const checks = lab[theme]?.[mode] ?? [];
  return (
    <Cells className={styles.grid}>
      <div className={styles.controls}>
        <Title id="brand-title">One root. A verified theme.</Title>
        <Body>
          Switch the theme and the mode. Every foreground and background pair the form renders is
          checked against WCAG 2.2 in each theme and mode before a release.
        </Body>
        <Panel>
          <div className={styles.control}>
            <span className={styles.controlName}>Theme</span>
            <ToggleGroup
              label="Theme"
              options={themes.map((id) => ({ value: id }))}
              value={theme}
              onChange={(id) => withoutTransitions(() => setTheme(id))}
            />
          </div>
          <div className={styles.control}>
            <span className={styles.controlName}>Mode</span>
            <ToggleGroup
              label="Mode"
              options={MODES}
              value={mode}
              onChange={(m) => withoutTransitions(() => setMode(m))}
            />
          </div>
          <ThemeRoot theme={theme} mode={mode}>
            <div
              className={styles.ramp}
              aria-label={`The primary scheme's roles in ${theme}, ${mode}`}
            >
              {swatches.map((token) => (
                <i key={token} data-swatch={token} title={token} />
              ))}
            </div>
          </ThemeRoot>
          <p className={styles.rampFoot}>
            primary scheme · {swatches.length} roles · {theme} {mode}
          </p>
        </Panel>
      </div>
      <Panel framed={false}>
        <ThemeRoot theme={theme} mode={mode}>
          <form
            className={styles.invite}
            onSubmit={(e) => e.preventDefault()}
            aria-label="Sample form"
          >
            <div className={styles.inviteHead}>
              <h3>Invite teammate</h3>
              <Badge size="small">Admin seat</Badge>
            </div>
            <Tabs defaultValue="members">
              <Tabs.List aria-label="Invite">
                <Tabs.Tab value="members">Members</Tabs.Tab>
                <Tabs.Tab value="roles">Roles</Tabs.Tab>
                <Tabs.Tab value="audit">Audit</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="members">
                <TextField
                  label="Work email"
                  type="email"
                  defaultValue="ayu@northwind.co"
                  description="They will get access to 3 workspaces."
                />
              </Tabs.Panel>
              <Tabs.Panel value="roles">Roles are granted after the invite is accepted.</Tabs.Panel>
              <Tabs.Panel value="audit">Every invite is recorded in the audit log.</Tabs.Panel>
            </Tabs>
            <div className={styles.actions}>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send invite
              </Button>
            </div>
          </form>
        </ThemeRoot>
        <ul className={styles.pairs} aria-label={`Contrast in ${theme}, ${mode} mode`}>
          {checks.map((check) => (
            <li key={check.label}>
              <span>{check.label}</span>
              <span className={styles.ratio}>{check.ratio.toFixed(1)} : 1</span>
              <Badge scheme={check.pass ? "success" : "danger"} size="small">
                {check.pass ? (check.minimum >= 4.5 ? "AA" : "3:1") : "Fail"}
              </Badge>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          WCAG 2.2, lowest ratio over sRGB and Display P3, computed with the token gate&apos;s
          method. The main action stays ink.
        </p>
      </Panel>
    </Cells>
  );
}
