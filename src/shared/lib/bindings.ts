import type { Binding, StyledSpec } from "./reference";

// The declarations a part has in one option combination and state, merged the
// way scripts/reference.mjs merges them for the contrast table (TDD styled CS3).
const weight = (b: Binding) => Object.keys(b.option ?? {}).length + (b.state ? 10 : 0);

export function effective(spec: Pick<StyledSpec, "anatomy" | "bindings">, part: string, option: Record<string, string>, state: string) {
  const chain: string[] = [];
  for (let p: string | undefined = part; p; p = spec.anatomy.find((a) => a.name === p)?.extends) chain.push(p);
  const out: Record<string, { value: string; from: Binding }> = {};
  spec.bindings
    .map((b, index) => ({ b, index }))
    .filter(({ b }) => chain.includes(b.part) && (!b.state || b.state === state) && Object.entries(b.option ?? {}).every(([k, v]) => option[k] === v))
    .toSorted((x, y) => weight(x.b) - weight(y.b) || x.index - y.index)
    .forEach(({ b }) => {
      for (const [property, value] of Object.entries(b.declarations)) {
        delete out[property];
        out[property] = { value, from: b };
      }
    });
  return out;
}

/** The tokens a declared value names: `{a.b} solid {c.d}` -> ["a.b", "c.d"]. */
export const tokensIn = (value: string) => [...value.matchAll(/\{([a-z0-9.-]+)\}/g)].map((m) => m[1]!);

/** The options' default combination. */
export const defaultsOf = (spec: Pick<StyledSpec, "options">) =>
  Object.fromEntries(Object.entries(spec.options).flatMap(([k, o]) => (o.default === null ? [] : [[k, o.default]]))) as Record<string, string>;
