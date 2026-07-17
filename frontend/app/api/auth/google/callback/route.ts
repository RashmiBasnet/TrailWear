import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { completeGoogleLogin } from "@/lib/auth";
import { clearOAuthStateToken } from "@/lib/cookie";

/**
 * Where Google sends the user back — this must match GOOGLE_CALLBACK_URL on the
 * backend and the Authorized redirect URI in the Google Cloud console, exactly.
 *
 * The callback lands here rather than on the API because the session cookie has
 * to be set on this origin: it is the only one the app reads cookies from.
 *
 * Every exit is a redirect. The user arrives here by navigation, so returning
 * JSON would leave them staring at it.
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const fail = async (message: string) => {
        await clearOAuthStateToken();
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
    };

    // The user pressed "Cancel" on Google's consent screen, or Google refused.
    if (params.get("error")) {
        return fail("Google sign-in was cancelled.");
    }

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
        return fail("Google sign-in could not be verified. Please try again.");
    }

    try {
        // The backend matches `state` against the cookie it issued and does the
        // code exchange; this route only relays and then routes the user onward.
        const result = await completeGoogleLogin(code, state);

        if (result.data?.mfaRequired) {
            return NextResponse.redirect(new URL("/login?mfa=required", request.url));
        }

        const role = result.data?.user?.role;
        return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/", request.url));
    } catch (err: Error | any) {
        return fail(err.message || "Google sign-in failed.");
    }
}
