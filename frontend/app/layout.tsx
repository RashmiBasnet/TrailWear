import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import LayoutShell from "@/app/_components/LayoutShell";
import CsrfProvider from "@/app/_components/CsrfProvider";
import { getCsrfToken } from "@/lib/csrf";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrailWear — Trekking and outdoor gear",
  description: "Trekking, hiking, and outdoor gear for every trail, from day hikes to high-altitude expeditions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const csrfToken = await getCsrfToken();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CsrfProvider token={csrfToken}>
          <ToastProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <LayoutShell>{children}</LayoutShell>
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </ToastProvider>
        </CsrfProvider>
      </body>
    </html>
  );
}
