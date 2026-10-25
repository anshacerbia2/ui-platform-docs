import "@scnx/system/styles/components.css";
import "@scnx/system/tokens/css/industrial.css";
import "@scnx/system/tokens/css/achromatic.css";
import "@/styles/main.scss";
import "@/generated/swatches.css";
import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import { MODE_COOKIE } from "@/features/site-shell/modeCookie";
import { SiteTheme } from "@/features/site-shell/SiteTheme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "Scnehaux UI — Build interfaces you can prove", template: "%s · Scnehaux UI" },
  description:
    "An accessible React design system with perceptual color, scoped multi-brand theming, and zero runtime CSS. Every release ships with the evidence that it works.",
  applicationName: "Scnehaux UI",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

const isMode = (value: string | undefined): value is "light" | "dark" | "system" => value === "light" || value === "dark" || value === "system";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // TDD docs-site D6: the stored preference, else the system preference Chromium
  // sends as a client hint, else light.
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const stored = cookieStore.get(MODE_COOKIE)?.value;
  const mode = isMode(stored) ? stored : "system";
  const system = headerStore.get("sec-ch-prefers-color-scheme") === "dark" ? "dark" : "light";
  const resolvedMode = mode === "system" ? system : mode;
  return (
    <html lang="en">
      <body>
        <SiteTheme mode={mode} resolvedMode={resolvedMode}>
          <div data-site-root="">
            <a className="u-skip-link" href="#main">
              Skip to content
            </a>
            {children}
          </div>
        </SiteTheme>
      </body>
    </html>
  );
}
