import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import type { ReactNode } from "react";
import { SITE_THEME } from "@/shared/lib/themes";

type ThemeRootProps = {
  /** A published theme id (TDD docs-site D16). Defaults to the site's own theme. */
  theme?: string;
  /** The mode every token inside resolves for. */
  mode: "light" | "dark";
  children: ReactNode;
};

/**
 * A fixed theme root: everything inside resolves one theme in one mode, whatever the
 * page's mode is. Specimens, the lights split and surfaces that are dark in either
 * mode use it; it stores no preference.
 */
export function ThemeRoot({ theme = SITE_THEME, mode, children }: ThemeRootProps) {
  return (
    <ThemeProvider themeId={theme} mode={mode} storage={false}>
      {children}
    </ThemeProvider>
  );
}

/** A theme root fixed to dark: code, terminals and the footer, in either site mode. */
export function DarkRoot({ children }: { children: ReactNode }) {
  return <ThemeRoot mode="dark">{children}</ThemeRoot>;
}
