// The search's shortcut by platform (TDD docs-site annex B 1.1), run on Node's type stripping.
import assert from "node:assert/strict";
import { test } from "node:test";
import { shortcutFor } from "../src/shared/lib/platform.ts";

const req = (h) => ({ get: (k) => h[k] ?? null });

test("Apple platforms say ⌘K, from the client hint or the user agent", () => {
  assert.equal(shortcutFor(req({ "sec-ch-ua-platform": '"macOS"' })), "⌘K");
  assert.equal(
    shortcutFor(req({ "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" })),
    "⌘K",
  );
  assert.equal(
    shortcutFor(req({ "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" })),
    "⌘K",
  );
});

test("every other platform says Ctrl K, and so does a request that names none", () => {
  assert.equal(
    shortcutFor(req({ "sec-ch-ua-platform": '"Windows"', "user-agent": "Macintosh" })),
    "Ctrl K",
  );
  assert.equal(
    shortcutFor(req({ "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:132.0)" })),
    "Ctrl K",
  );
  assert.equal(shortcutFor(req({})), "Ctrl K");
});
