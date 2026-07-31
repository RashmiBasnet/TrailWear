// Production entrypoint for the frontend container.
//
// Next's `output: "standalone"` server (`server.js`) speaks HTTP only, so it
// cannot serve the app over TLS the way the local `next dev --experimental-https`
// flow does. This tiny custom server wraps Next's production request handler in
// a Node HTTPS server instead, giving the container the same end-to-end TLS as
// the backend: the browser reaches the frontend over HTTPS, and the frontend's
// own server-side calls to the backend stay over HTTPS too.
//
// It mirrors the backend's behaviour (see backend/src/index.ts): serve HTTPS
// when a readable key/cert pair is configured, otherwise degrade to HTTP rather
// than crash. A cert that is set but unreadable is shouted about, not silently
// downgraded.
import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import next from "next";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

let server;
let protocol = "http";

if (keyPath && certPath) {
  try {
    const key = readFileSync(keyPath);
    const cert = readFileSync(certPath);
    server = createHttpsServer({ key, cert }, (req, res) => handle(req, res));
    protocol = "https";
  } catch (err) {
    console.error(
      `SSL_KEY_PATH/SSL_CERT_PATH are set but could not be read — serving HTTP: ${
        err instanceof Error ? err.message : "unknown error"
      }`
    );
  }
}

if (!server) {
  server = createHttpServer((req, res) => handle(req, res));
}

server.listen(port, hostname, () => {
  console.log(`TrailWear frontend listening on ${protocol}://${hostname}:${port}`);
});

let shuttingDown = false;
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    const forceExit = setTimeout(() => process.exit(1), 10_000);
    forceExit.unref();
    server.close(() => process.exit(0));
  });
}
