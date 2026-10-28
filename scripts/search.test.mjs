// The search's ranking (TDD docs-site D22, annex B 2), run on Node's type stripping.
import assert from "node:assert/strict";
import { test } from "node:test";
import { rank } from "../src/shared/lib/search.ts";

const row = (t, k = "Component", d = "") => ({ t, h: `/${t}`, k, d });
const titles = (rows, q) => rank(rows, q).map((h) => h.row.t);

test("a whole title outranks its start, a word's start, a part, a description and letters", () => {
  const rows = [
    row("Icon button"),
    row("Buttons"),
    row("Button"),
    row("Rebutton"),
    row("Card", "Component", "a button holder"),
    row("Bxuxtxton"),
  ];
  assert.deepEqual(titles(rows, "button"), [
    "Button",
    "Buttons",
    "Icon button",
    "Rebutton",
    "Card",
    "Bxuxtxton",
  ]);
});

test("every term must match, and each matched part is marked", () => {
  const rows = [row("effect.shadow.low", "Token"), row("effect.material.sheet", "Token")];
  assert.deepEqual(titles(rows, "effect shadow"), ["effect.shadow.low"]);
  assert.deepEqual(rank(rows, "effect shadow")[0].marks, [
    [0, 6],
    [7, 13],
  ]);
});

test("letters in order match; a transposed pair does not", () => {
  const rows = [row("Button")];
  assert.deepEqual(titles(rows, "buton"), ["Button"]);
  assert.deepEqual(titles(rows, "btuton"), []);
});

test("an empty query finds nothing, and the kind breaks a tie", () => {
  assert.deepEqual(rank([row("Menu")], "  "), []);
  assert.deepEqual(titles([row("Menu", "Token"), row("Menu", "Page")], "menu"), ["Menu", "Menu"]);
  assert.equal(rank([row("Menu", "Token"), row("Menu", "Page")], "menu")[0].row.k, "Page");
});
