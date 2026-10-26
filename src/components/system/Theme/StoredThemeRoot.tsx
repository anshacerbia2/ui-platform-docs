"use client";

import {
  createThemeStore,
  ThemeProvider,
  type ResolvedMode,
  type ThemeMode,
  type ThemePreferenceAdapter,
} from "@scnx/core-ui/providers/theme-provider-base";
import { useState, type ReactNode } from "react";
import { SITE_THEME } from "@/shared/lib/themes";

type StoredThemeRootProps = {
  /** The stored preference the server read. */
  mode: ThemeMode;
  /** The mode the server rendered, so the first client render matches it. */
  resolvedMode: ResolvedMode;
  /** Where the reader's choice is kept. */
  preference: ThemePreferenceAdapter;
  children: ReactNode;
};

/**
 * The page's own theme root: the site's theme in the reader's mode, kept by
 * `preference` and started from what the server rendered (TDD docs-site D6).
 */
export function StoredThemeRoot({
  mode,
  resolvedMode,
  preference,
  children,
}: StoredThemeRootProps) {
  const [store] = useState(() =>
    createThemeStore({
      themeId: SITE_THEME,
      defaultMode: "system",
      serverHint: { mode, resolvedMode },
      storage: preference,
    }),
  );
  return (
    <ThemeProvider themeId={SITE_THEME} store={store}>
      {children}
    </ThemeProvider>
  );
}
