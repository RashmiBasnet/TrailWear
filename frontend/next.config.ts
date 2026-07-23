import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.gstatic.com",
  "font-src 'self' data:",
  `connect-src 'self' https://www.google.com${isDev ? " ws: wss:" : ""}`,
  "frame-src 'self' https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://*.esewa.com.np",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Note: /uploads is served by app/uploads/[...path]/route.ts, not a rewrite —
  // the rewrite proxy can't be given a CA to trust the API's local HTTPS cert,
  // so images 404'd over TLS. The route handler fetches them with that CA.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
