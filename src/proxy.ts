import { type NextRequest, NextResponse } from "next/server";

// TDD docs-site D5: a strict, nonce-based Content-Security-Policy on every
// document, the policy ui-platform's Next.js fixture proves the packages run
// under (TDD packaging S4). Next.js reads the nonce from the request header
// and applies it to its own scripts; 'strict-dynamic' lets those scripts load
// the chunks they need. No inline style attribute is allowed, so the site
// sets dynamic styles through the CSSOM only.
const directives = (nonce: string, development: boolean, https: boolean) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    // In development, hot reload injects style elements without a nonce; a nonce
    // in the list would make browsers ignore 'unsafe-inline', so it is left out.
    development ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    development ? "connect-src 'self' ws:" : "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Only meaningful on a page served over HTTPS; on plain HTTP (a local production
    // server) WebKit would upgrade the page's own same-origin requests and fail them.
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

export function proxy(request: NextRequest) {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const policy = directives(
    nonce,
    process.env.NODE_ENV === "development",
    request.nextUrl.protocol === "https:",
  );
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|llms.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
