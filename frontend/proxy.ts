import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSRF_COOKIE = "csrf_token";

export function proxy(request: NextRequest) {
    const existing = request.cookies.get(CSRF_COOKIE)?.value;
    let token = existing;

    if (!token) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
        // Make the new token visible to server components on THIS request
        request.cookies.set(CSRF_COOKIE, token);
    }

    const response = NextResponse.next({ request });

    if (!existing) {
        response.cookies.set({
            name: CSRF_COOKIE,
            value: token,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)"],
};
