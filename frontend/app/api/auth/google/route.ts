import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startGoogleLogin } from "@/lib/auth";

/**
 * Where the "Continue with Google" button points.
 *
 * A plain link to a route handler rather than a fetch, because the browser has
 * to leave for accounts.google.com — a redirect returned to fetch() would just
 * be followed in the background and never show the consent screen.
 */
export async function GET(request: NextRequest) {
    try {
        const result = await startGoogleLogin();
        return NextResponse.redirect(result.data.url);
    } catch (err: Error | any) {
        const message = err.message || "Could not start Google sign-in";
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
    }
}
