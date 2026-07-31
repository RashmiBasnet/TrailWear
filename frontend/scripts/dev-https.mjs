// Starts `next dev` over HTTPS with the mkcert cert, and — crucially — sets
// NODE_EXTRA_CA_CERTS on the child process so Node trusts the mkcert CA when the
// server calls the backend over HTTPS. Doing it here (rather than relying on a
// shell env var) means `npm run dev` works regardless of how the terminal was
// launched, sidestepping the VS Code "terminals inherit a stale environment"
// trap.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const localAppData =
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
const caRoot =
  process.env.MKCERT_CAROOT || path.join(localAppData, "mkcert", "rootCA.pem");

const env = { ...process.env };
if (existsSync(caRoot)) {
  env.NODE_EXTRA_CA_CERTS = caRoot;
  console.log(`[dev-https] trusting mkcert CA: ${caRoot}`);
} else {
  console.warn(
    `[dev-https] mkcert rootCA.pem not found at ${caRoot} — HTTPS calls to the backend will fail to verify. Run \`mkcert -install\` or set MKCERT_CAROOT.`
  );
}

const child = spawn(
  "next",
  [
    "dev",
    "--experimental-https",
    "--experimental-https-key",
    "./certs/localhost-key.pem",
    "--experimental-https-cert",
    "./certs/localhost.pem",
  ],
  { stdio: "inherit", env, shell: true }
);

child.on("exit", (code) => process.exit(code ?? 0));
