import { ThemeProvider } from "@scnx/core-ui/providers/theme-provider-base";
import type { ReactNode } from "react";
import { SITE_THEME } from "@/shared/lib/themes";

/**
 * A theme root fixed to dark mode, for surfaces that are dark in either site
 * mode (code, terminals, the footer). Inside it every token, and every site
 * role, resolves for dark, so the content needs no inverse colors of its own.
 */
export function DarkRoot({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider themeId={SITE_THEME} mode="dark" storage={false}>
      {children}
    </ThemeProvider>
  );
}
