"use client";

import { useState } from "react";
import { Swatch } from "@/components/docs/Swatch";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
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
        <ToggleGroup
          label="Theme"
          size="small"
          options={themes.map((id) => ({ value: id }))}
          value={theme}
          onChange={(id) => withoutTransitions(() => setTheme(id))}
        />
        <ToggleGroup
          label="Mode"
          size="small"
          options={MODES}
          value={mode}
          onChange={(m) => withoutTransitions(() => setMode(m))}
        />
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
              <ToggleGroup
                label={name}
                size="small"
                options={o.values.map((value) => ({ value }))}
                value={option[name] ?? ""}
                onChange={(value) => setOption({ ...option, [name]: value })}
              />
            </fieldset>
          ))}
          {propStates.length > 0 ? (
            <fieldset className={styles.control}>
              <legend className={styles.controlName}>state</legend>
              <ToggleGroup
                label="state"
                size="small"
                options={[
                  { value: "", label: "rest" },
                  ...propStates.map((s) => ({ value: s.name })),
                ]}
                value={state}
                onChange={setState}
              />
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
