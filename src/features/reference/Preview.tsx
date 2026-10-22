"use client";

import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { registry } from "@/generated/registry";
import { defaultsOf, effective, tokensIn } from "@/shared/lib/bindings";
import type { FixtureNode, StyledSpec } from "@/shared/lib/reference";
import styles from "./Preview.module.scss";

// The specification's own fixture (TDD styled CS7), rendered the way the
// conformance check renders it: a node type is an export ("Tabs"), a
// sub-component ("Tabs.List"), or an element ("span"); option values and
// prop-entered states are props of the root node.
function resolve(mod: Record<string, unknown>, type: string | null): ElementType {
  if (type === null) return Object.values(mod).find((v) => typeof v === "function") as ElementType;
  if (/^[a-z]/.test(type)) return type as ElementType;
  const found = type.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], mod);
  if (!found) throw new Error(`no export ${type}`);
  return found as ElementType;
}

function build(mod: Record<string, unknown>, node: FixtureNode | string, extra?: Record<string, unknown>, key?: number): ReactNode {
  if (typeof node === "string") return node;
  return createElement(resolve(mod, node.type), { key, ...node.props, ...extra }, ...(node.children ?? []).map((child, i) => build(mod, child, undefined, i)));
}

type Props = { slug: string; spec: Pick<StyledSpec, "anatomy" | "options" | "states" | "fixture" | "bindings">; themes: string[] };

/** The live preview: options, prop-entered states, theme, and mode; the root's bindings beside it. */
export function Preview({ slug, spec, themes }: Props) {
  const mod = registry[slug] ?? {};
  const [option, setOption] = useState(() => defaultsOf(spec));
  const [state, setState] = useState("");
  const [theme, setTheme] = useState(themes[0] ?? "default");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const stage = useRef<HTMLDivElement>(null);
  const propStates = spec.states.filter((s) => "props" in s.enter);
  const enter = (propStates.find((s) => s.name === state)?.enter.props ?? {}) as Record<string, unknown>;
  const rootProps = {
    ...Object.fromEntries(Object.entries(option).map(([k, v]) => [k, spec.options[k]?.values.join() === "false,true" ? v === "true" : v])),
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

  const root = spec.anatomy[0]?.name ?? "root";
  const lineage = Object.entries(effective(spec, root, option, state));

  return (
    <div className={styles.preview}>
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
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.body}>
        <ThemeProvider themeId={theme} mode={mode} storage={false}>
          <div ref={stage} className={styles.stage} data-dialog={spec.fixture.activate ? "" : undefined}>
            <span className={styles.stageLabel}>
              live · the specification&apos;s fixture · {theme} {mode}
            </span>
            <div className={styles.stageContent}>
              {spec.fixture.tree ? build(mod, spec.fixture.tree, rootProps) : createElement(resolve(mod, null), { ...spec.fixture.props, ...rootProps })}
            </div>
          </div>
        </ThemeProvider>
        <div className={styles.controls}>
          {Object.entries(spec.options).map(([name, o]) => (
            <fieldset key={name} className={styles.control}>
              <legend className={styles.controlName}>{name}</legend>
              <div className={styles.choices}>
                {o.values.map((value) => (
                  <button key={value} type="button" aria-pressed={option[name] === value} onClick={() => setOption({ ...option, [name]: value })}>
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {propStates.length > 0 ? (
            <fieldset className={styles.control}>
              <legend className={styles.controlName}>state</legend>
              <div className={styles.choices}>
                {["", ...propStates.map((s) => s.name)].map((name) => (
                  <button key={name || "rest"} type="button" aria-pressed={state === name} onClick={() => setState(name)}>
                    {name || "rest"}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          {lineage.length > 0 ? (
            <div className={styles.lineage}>
              <h3 className={styles.controlName}>Token lineage · {root}</h3>
              <dl className={styles.lineageList}>
                {lineage.map(([property, { value }]) => (
                  <div key={property} className={styles.lineageRow}>
                    <dt>{property}</dt>
                    <dd>
                      {tokensIn(value)
                        .filter((t) => t.startsWith("color."))
                        .map((t) => (
                          <span key={t} className={styles.dot} data-swatch={t} />
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
