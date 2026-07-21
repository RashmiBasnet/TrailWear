import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { completeGoogleLogin } from "@/lib/auth";
import { clearOAuthStateToken } from "@/lib/cookie";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const fail = async (message: string) => {
        await clearOAuthStateToken();
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
    };

    if (params.get("error")) {
        return fail("Google sign-in was cancelled.");
    }

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) {
        return fail("Google sign-in could not be verified. Please try again.");
    }

    try {
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
