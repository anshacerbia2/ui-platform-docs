"use client";

import { useState, type ReactNode } from "react";
import { createThemeStore, ThemeProvider, type ResolvedMode, type ThemeMode, type ThemePreferenceAdapter } from "@scnx/core-ui/providers/theme-provider-base";

export const MODE_COOKIE = "scnx-theme-mode";

// TDD docs-site D6: the mode preference lives in a cookie, so the server
// renders the reader's mode and the first client render matches it.
const cookiePreference: ThemePreferenceAdapter = {
  read: () => new RegExp(`(?:^|; )${MODE_COOKIE}=(light|dark|system)(?:;|$)`).exec(document.cookie)?.[1] ?? null,
  write: (mode) => {
    document.cookie = `${MODE_COOKIE}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  },
};

/** The site's theme root: the default theme, in the mode the server resolved. */
export function SiteTheme({ mode, resolvedMode, children }: { mode: ThemeMode; resolvedMode: ResolvedMode; children: ReactNode }) {
  const [store] = useState(() =>
    createThemeStore({ themeId: "default", defaultMode: "system", serverHint: { mode, resolvedMode }, storage: cookiePreference }),
  );
  return (
    <ThemeProvider themeId="default" store={store}>
      {children}
    </ThemeProvider>
  );
}
