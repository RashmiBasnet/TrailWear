import { NextResponse } from "next/server";
import axios from "axios";
import { localCaAgent } from "@/lib/localCa";

export const dynamic = "force-dynamic";

const API_BASE_URL =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000";

type RouteContext = {
    params: Promise<{ path: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { path } = await context.params;

    // Only plain filename/path segments are accepted. Encoding each segment
    // avoids traversal and keeps the configured API origin fixed.
    if (
        !Array.isArray(path) ||
        path.length === 0 ||
        path.some((segment) => !segment || segment === "." || segment === "..")
    ) {
        return NextResponse.json({ success: false, message: "Invalid upload path" }, { status: 400 });
    }

    const uploadPath = path.map(encodeURIComponent).join("/");
    const target = `${API_BASE_URL.replace(/\/+$/, "")}/uploads/${uploadPath}`;

    try {
        const upstream = await axios.get<ArrayBuffer>(target, {
            responseType: "arraybuffer",
            httpsAgent: localCaAgent(target),
            validateStatus: () => true,
        });

        if (upstream.status < 200 || upstream.status >= 300) {
            return new NextResponse(null, { status: upstream.status });
        }

        const headers = new Headers();
        for (const name of ["content-type", "content-length", "etag", "last-modified"]) {
            const value = upstream.headers[name];
            if (value !== undefined) headers.set(name, String(value));
        }
        headers.set("Cache-Control", "public, max-age=3600");
        headers.set("X-Content-Type-Options", "nosniff");

        return new NextResponse(upstream.data, {
            status: upstream.status,
            headers,
        });
    } catch (error) {
        console.error(
            "Failed to proxy uploaded image",
            axios.isAxiosError(error)
                ? { code: error.code, message: error.message }
                : error
        );
        return NextResponse.json(
            { success: false, message: "Upload service unavailable" },
            { status: 502 }
        );
    }
}
