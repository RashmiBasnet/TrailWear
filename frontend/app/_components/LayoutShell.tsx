"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";

const CHROME_HIDDEN_ROUTES = ["/login", "/signup"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideChrome = CHROME_HIDDEN_ROUTES.includes(pathname ?? "");

    return (
        <>
            {!hideChrome && <Navbar />}
            {children}
            {!hideChrome && <Footer />}
        </>
    );
}
