import fs from "fs";
import path from "path";
import https from "https";

/**
 * An HTTPS agent that trusts the local mkcert root CA, so server-side calls to
 * the API over its locally-trusted HTTPS cert actually verify. Returns undefined
 * for non-HTTPS targets, or when no CA file is found (e.g. production, where the
 * platform's own CA store applies) — leaving default verification in place.
 *
 * Loading the CA explicitly here is deliberate: NODE_EXTRA_CA_CERTS does not
 * reliably survive Next's dev-server process fork, so relying on it left the
 * server-side fetches failing with UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 */
export function localCaAgent(targetUrl: string): https.Agent | undefined {
    if (!targetUrl.startsWith("https")) return undefined;
    const caPath =
        process.env.NODE_EXTRA_CA_CERTS ||
        (process.env.LOCALAPPDATA
            ? path.join(process.env.LOCALAPPDATA, "mkcert", "rootCA.pem")
            : undefined);
    if (!caPath) return undefined;
    try {
        return new https.Agent({
            ca: fs.readFileSync(/* turbopackIgnore: true */ caPath),
        });
    } catch {
        return undefined;
    }
}
