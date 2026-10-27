"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { Swatch } from "@/components/docs/Swatch";
import { ToggleGroup } from "@/components/docs/ToggleGroup";
import { ThemeRoot } from "@/components/system/Theme";
import { withoutTransitions } from "@/shared/lib/withoutTransitions";
import { registry } from "@/generated/registry";
import { defaultsOf, effective, tokensIn } from "@/shared/lib/bindings";
import type { FixtureNode, StyledSpec } from "@/shared/lib/reference";
import { useThemeChoice } from "./ThemeChoice";
import styles from "./Preview.module.scss";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

// The specification's own fixture (TDD styled CS7), rendered the way the
// conformance check renders it: a node type is an export ("Tabs"), a
// sub-component ("Tabs.List"), or an element ("span"); option values and
// prop-entered states are props of the root node.
function resolve(mod: Record<string, unknown>, type: string | null): ElementType {
  if (type === null) return Object.values(mod).find((v) => typeof v === "function") as ElementType;
  if (/^[a-z]/.test(type)) return type as ElementType;
  const found = type
    .split(".")
    .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], mod);
  if (!found) throw new Error(`no export ${type}`);
  return found as ElementType;
}

// The site's Content-Security-Policy allows no style attribute in server HTML
// (TDD docs-site D5), so a fixture's `style` (Skeleton's width) is held back from
// the markup, its node marked, and the style set through the CSSOM after render.
function withoutStyle(props: Record<string, unknown> | undefined, held: object[]) {
  if (!props || !("style" in props)) return props;
  const { style, ...rest } = props;
  held.push(style as object);
  return { ...rest, "data-fixture-style": held.length - 1 };
}

function build(
  mod: Record<string, unknown>,
  node: FixtureNode | string,
  held: object[],
  extra?: Record<string, unknown>,
  key?: number,
): ReactNode {
  if (typeof node === "string") return node;
  return createElement(
    resolve(mod, node.type),
    { key, ...withoutStyle(node.props, held), ...extra },
    ...(node.children ?? []).map((child, i) => build(mod, child, held, undefined, i)),
  );
}

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
  const mod = registry[slug] ?? {};
  const [option, setOption] = useState(() => defaultsOf(spec));
  const [state, setState] = useState("");
  // Shared with the hooks table, so it shows values for the theme and mode the preview shows.
  const { theme, setTheme, mode, setMode } = useThemeChoice(themes);
  const stage = useRef<HTMLDivElement>(null);
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

  // The conformance check opens a dialog fixture with showModal(); on a page that would
  // make the rest of the document inert, so the preview shows it non-modally in the stage.
  useEffect(() => {
    if (spec.fixture.activate !== "showModal") return;
    const dialog = stage.current?.querySelector("dialog");
    if (dialog && !dialog.open) dialog.show();
    return () => dialog?.close();
  }, [spec.fixture.activate]);

  const held: object[] = [];
  const specimen = spec.fixture.tree
    ? build(mod, spec.fixture.tree, held, rootProps)
    : createElement(resolve(mod, null), {
        ...withoutStyle(spec.fixture.props, held),
        ...rootProps,
      });
  // Every render: a theme or option change may remount the specimen.
  useLayoutEffect(() => {
    held.forEach((style, i) => {
      const node = stage.current?.querySelector<HTMLElement>(`[data-fixture-style="${i}"]`);
      if (node) Object.assign(node.style, style);
    });
  });

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
          <div
            ref={stage}
            className={styles.stage}
            data-dialog={spec.fixture.activate ? "" : undefined}
          >
            <span className={styles.stageLabel}>
              live · the specification&apos;s fixture · {theme} {mode}
            </span>
            <div className={styles.stageContent}>{specimen}</div>
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
