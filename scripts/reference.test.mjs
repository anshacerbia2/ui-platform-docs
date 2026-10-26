import assert from "node:assert/strict";
import test from "node:test";
import { combinations, contrastCases, effective } from "./reference.mjs";

const spec = {
  anatomy: [
    { name: "root", selector: ".scnx-x" },
    { name: "item", selector: ".scnx-x__item", extends: "root" },
  ],
  options: {
    tone: { values: ["a", "b"], default: "a", selector: "[data-tone={value}]" },
    size: { values: ["s", "m"], default: "s", selector: "[data-size={value}]" },
  },
  states: [
    { name: "hover", selectors: [":hover"], enter: { interaction: "hover" } },
    { name: "disabled", selectors: [":disabled"], enter: { props: { disabled: true } } },
  ],
  bindings: [
    { part: "root", declarations: { color: "{c.fg}", background: "{c.bg}" } },
    { part: "root", option: { tone: "b" }, declarations: { color: "{c.fg-b}" } },
    {
      part: "root",
      option: { tone: "b" },
      state: "hover",
      declarations: { background: "{c.bg-hover}" },
    },
    { part: "root", state: "disabled", declarations: { color: "{c.off}" } },
  ],
};

test("options vary one at a time from the defaults", () => {
  assert.deepEqual(combinations(spec), [
    { tone: "a", size: "s" },
    { tone: "b", size: "s" },
    { tone: "a", size: "m" },
  ]);
});

test("options named together by one binding vary jointly", () => {
  const joint = {
    ...spec,
    bindings: [
      ...spec.bindings,
      { part: "root", option: { tone: "b", size: "m" }, declarations: { gap: "{d.g}" } },
    ],
  };
  assert.equal(combinations(joint).length, 4);
});

test("a more specific binding wins, and a part takes the bindings of the part it refines", () => {
  const d = effective(spec, "item", { tone: "b", size: "s" }, "hover");
  assert.equal(d.color, "{c.fg-b}");
  assert.equal(d.background, "{c.bg-hover}");
});

test("contrast cases skip disabled states and name both tokens", () => {
  const cases = contrastCases(spec);
  assert.ok(cases.every((c) => c.state !== "disabled"));
  assert.ok(
    cases.some(
      (c) =>
        c.option.tone === "b" && c.state === "hover" && c.fg === "c.fg-b" && c.bg === "c.bg-hover",
    ),
  );
});
