import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// TDD docs-site D5: security headers for every route. The Content-Security-Policy
// is set per request by proxy.ts, because it carries a fresh nonce.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // TDD docs-site D6: Chromium sends the color-scheme preference on the first
  // request, so a page in system mode renders dark on the server, without a flash.
  { key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" },
  { key: "Critical-CH", value: "Sec-CH-Prefers-Color-Scheme" },
];

const config: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // A component stylesheet reads the ITCSS settings and tools by name
  // (`@use "settings"`), wherever its folder sits (TDD docs-site D4, D17).
  sassOptions: { loadPaths: [fileURLToPath(new URL("./src/styles", import.meta.url))] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default createMDX({})(config);
