/**
 * The search's shortcut as the reader's platform names it, from the request: the
 * `Sec-CH-UA-Platform` hint Chromium sends, or the user agent elsewhere (Safari,
 * Firefox). Apple platforms say ⌘K, every other Ctrl K. Read on the server, so the strip
 * is whole in its first paint (TDD docs-site annex B 1.1).
 */
export function shortcutFor(headers: Pick<Headers, "get">): string {
  const platform = headers.get("sec-ch-ua-platform") ?? headers.get("user-agent") ?? "";
  return /mac|iphone|ipad|ios/i.test(platform) ? "⌘K" : "Ctrl K";
}
