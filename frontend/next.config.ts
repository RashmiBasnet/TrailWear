import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_BASE_URL}/uploads/:path*`,
      },
    ];
  },
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
