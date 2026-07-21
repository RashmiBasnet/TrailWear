import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const CSRF_COOKIE = "csrf_token";

export async function getCsrfToken(): Promise<string> {
    const store = await cookies();
    return store.get(CSRF_COOKIE)?.value ?? "";
}

export async function assertCsrf(token: string | undefined): Promise<void> {
    const expected = await getCsrfToken();

    if (!expected || !token) {
        throw new Error("Invalid CSRF token");
    }

    const a = Buffer.from(expected);
    const b = Buffer.from(token);

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new Error("Invalid CSRF token");
    }
}
