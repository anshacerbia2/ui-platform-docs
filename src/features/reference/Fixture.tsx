"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import type { FixtureNode, StyledSpec } from "@/shared/lib/reference";
import styles from "./Preview.module.scss";

export type FixtureProps = {
  fixture: StyledSpec["fixture"];
  /** Option values and prop-entered states, set on the fixture's root node. */
  rootProps: Record<string, unknown>;
};

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

/**
 * One component's fixture, from its own module. Each component page loads only its
 * component's chunk (src/generated/specimens.tsx, one `next/dynamic` per component),
 * not the whole system.
 */
export function Fixture({ mod, fixture, rootProps }: FixtureProps & { mod: object }) {
  const box = useRef<HTMLDivElement>(null);
  const exports = mod as Record<string, unknown>;

  // The conformance check opens a dialog fixture with showModal(); on a page that would
  // make the rest of the document inert, so the preview shows it non-modally in the stage.
  useEffect(() => {
    if (fixture.activate !== "showModal") return;
    const dialog = box.current?.querySelector("dialog");
    if (dialog && !dialog.open) dialog.show();
    return () => dialog?.close();
  }, [fixture.activate]);

  const held: object[] = [];
  const specimen = fixture.tree
    ? build(exports, fixture.tree, held, rootProps)
    : createElement(resolve(exports, null), { ...withoutStyle(fixture.props, held), ...rootProps });
  // Every render: a theme or option change may remount the specimen.
  useLayoutEffect(() => {
    held.forEach((style, i) => {
      const node = box.current?.querySelector<HTMLElement>(`[data-fixture-style="${i}"]`);
      if (node) Object.assign(node.style, style);
    });
  });

  return (
    <div ref={box} className={styles.fixture}>
      {specimen}
    </div>
  );
}
