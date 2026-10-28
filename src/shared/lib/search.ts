/**
 * The site's search (TDD docs-site D22): the index scripts/reference.mjs writes to
 * `/search.json`, fetched once, the first time the search or the menu opens, and ranked
 * here with no library: the title matched as a whole, at its start, at a word's start,
 * anywhere, then the description, then the letters in order. Every term must match.
 */

export type SearchKind = "Page" | "Component" | "Primitive" | "Token";
export type SearchRow = { t: string; h: string; k: SearchKind; d: string };
export type SearchHit = { row: SearchRow; score: number; marks: [number, number][] };

export const KINDS: SearchKind[] = ["Page", "Component", "Primitive", "Token"];

let index: Promise<SearchRow[]> | null = null;

/** The index, fetched once per visit; a failed fetch is tried again next time. */
export function loadIndex(): Promise<SearchRow[]> {
  index ??= fetch("/search.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchRow[]>) : Promise.reject(r.status)))
    .catch((error) => {
      index = null;
      throw error;
    });
  return index;
}

// a word starts after a space, a dot or a hyphen
const WORD = /[\s.\-/]/;
const KIND_WEIGHT: Record<SearchKind, number> = {
  Page: 40,
  Component: 30,
  Primitive: 20,
  Token: 0,
};

function scoreTerm(title: string, desc: string, term: string): [number, [number, number] | null] {
  if (title === term) return [1000, [0, term.length]];
  if (title.startsWith(term)) return [800, [0, term.length]];
  let at = title.indexOf(term);
  while (at > 0 && !WORD.test(title[at - 1] ?? "")) at = title.indexOf(term, at + 1);
  if (at > 0) return [600, [at, at + term.length]];
  const inside = title.indexOf(term);
  if (inside >= 0) return [400, [inside, inside + term.length]];
  if (desc.includes(term)) return [150, null];
  // the term's letters in order in the title, closer together scoring higher
  let from = 0;
  let first = -1;
  for (const ch of term) {
    const found = title.indexOf(ch, from);
    if (found < 0) return [0, null];
    if (first < 0) first = found;
    from = found + 1;
  }
  return [Math.max(1, 100 - (from - first - term.length) * 4), null];
}

/** The rows that match every term of `query`, best first. */
export function rank(rows: SearchRow[], query: string, limit = 60): SearchHit[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  for (const row of rows) {
    const title = row.t.toLowerCase();
    const desc = row.d.toLowerCase();
    let score = 0;
    const marks: [number, number][] = [];
    let all = true;
    for (const term of terms) {
      const [s, mark] = scoreTerm(title, desc, term);
      if (!s) {
        all = false;
        break;
      }
      score += s;
      if (mark) marks.push(mark);
    }
    if (!all) continue;
    hits.push({ row, score: score + KIND_WEIGHT[row.k] - title.length * 0.5, marks });
  }
  return hits.toSorted((a, b) => b.score - a.score).slice(0, limit);
}
