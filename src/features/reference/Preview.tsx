"use client";

import { useState } from "react";
import { Swatch } from "@/components/docs/Swatch";
import { SegmentedControl } from "@/components/system/SegmentedControl";
import { ThemeRoot } from "@/components/system/Theme";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import { specimens } from "@/generated/specimens";
import { defaultsOf, effective, tokensIn } from "@/shared/lib/bindings";
import type { StyledSpec } from "@/shared/lib/reference";
import { useThemeChoice } from "@/components/docs/ThemeChoice";
import styles from "./Preview.module.scss";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Props = {
  slug: string;
  spec: Pick<StyledSpec, "anatomy" | "options" | "states" | "fixture" | "bindings">;
  themes: string[];
};

/**
 * The live preview (scnx-platform Docs-Button.html, "Preview"): the specification's
 * fixture on a stage in the chosen theme and mode, the options and prop-entered
 * states beside it, and the root's token lineage for that combination.
 */
export function Preview({ slug, spec, themes }: Props) {
  const Specimen = specimens[slug];
  const [option, setOption] = useState(() => defaultsOf(spec));
  const [state, setState] = useState("");
  // Shared with the hooks table, so it shows values for the theme and mode the preview shows.
  const { theme, setTheme, mode, setMode } = useThemeChoice(themes);

  const propStates = spec.states.filter((s) => "props" in s.enter);
  const enter = (propStates.find((s) => s.name === state)?.enter.props ?? {}) as Record<
    string,
    unknown
  >;
  const rootProps = {
    ...Object.fromEntries(
      Object.entries(option).map(([k, v]) => [
        k,
        spec.options[k]?.values.join() === "false,true" ? v === "true" : v,
      ]),
    ),
    ...enter,
  };

  const root = spec.anatomy[0]?.name ?? "root";
  const lineage = Object.entries(effective(spec, root, option, state));

  return (
    <div className={styles.preview}>
      <div className={styles.toolbar}>
        <SegmentedControl
          aria-label="Theme"
          size="small"
          value={theme}
          onValueChange={(id) => withoutTransitions(() => setTheme(id))}
        >
          {themes.map((id) => (
            <SegmentedControl.Item key={id} value={id}>
              {id}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
        <SegmentedControl
          aria-label="Mode"
          size="small"
          value={mode}
          onValueChange={(m) => withoutTransitions(() => setMode(m === "dark" ? "dark" : "light"))}
        >
          {MODES.map((m) => (
            <SegmentedControl.Item key={m.value} value={m.value}>
              {m.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl>
      </div>
      <div className={styles.body}>
        <ThemeRoot theme={theme} mode={mode}>
          <div className={styles.stage} data-dialog={spec.fixture.activate ? "" : undefined}>
            <span className={styles.stageLabel}>
              live · the specification&apos;s fixture · {theme} {mode}
            </span>
            <div className={styles.stageContent}>
              {Specimen ? <Specimen fixture={spec.fixture} rootProps={rootProps} /> : null}
            </div>
          </div>
        </ThemeRoot>
        <div className={styles.controls}>
          {Object.entries(spec.options).map(([name, o]) => (
            <fieldset key={name} className={styles.control}>
              <legend className={styles.controlName}>{name}</legend>
              <SegmentedControl
                aria-label={name}
                size="small"
                value={option[name] ?? ""}
                onValueChange={(value) => setOption({ ...option, [name]: value })}
              >
                {o.values.map((value) => (
                  <SegmentedControl.Item key={value} value={value}>
                    {value}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl>
            </fieldset>
          ))}
          {propStates.length > 0 ? (
            <fieldset className={styles.control}>
              <legend className={styles.controlName}>state</legend>
              <SegmentedControl
                aria-label="state"
                size="small"
                value={state}
                onValueChange={setState}
              >
                <SegmentedControl.Item value="">rest</SegmentedControl.Item>
                {propStates.map((s) => (
                  <SegmentedControl.Item key={s.name} value={s.name}>
                    {s.name}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl>
            </fieldset>
          ) : null}
          {lineage.length > 0 ? (
            <div className={styles.lineage}>
              <h3 className={styles.controlName}>Token lineage · {root}</h3>
              <dl>
                {lineage.map(([property, { value }]) => (
                  <div key={property}>
                    <dt>{property}</dt>
                    <dd>
                      {tokensIn(value)
                        .filter((t) => t.startsWith("color."))
                        .map((t) => (
                          <Swatch key={t} token={t} />
                        ))}
                      <code>{value.replace(/\{([a-z0-9.-]+)\}/g, "$1")}</code>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
