#!/usr/bin/env bash
# Generates the locally-trusted TLS certificate used by the Docker stack.
# See generate-certs.ps1 for the full rationale. The cert covers the browser
# origin (localhost) and the Compose service DNS names (backend, frontend) so
# container-to-container HTTPS verifies. rootCA.pem is copied alongside so both
# containers can trust the CA via NODE_EXTRA_CA_CERTS.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cert_dir="$script_dir/../certs"
mkdir -p "$cert_dir"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert not found. Install it first: https://github.com/FiloSottile/mkcert" >&2
  exit 1
fi

mkcert -install
mkcert \
  -cert-file "$cert_dir/localhost.pem" \
  -key-file "$cert_dir/localhost-key.pem" \
  localhost 127.0.0.1 ::1 backend frontend

cp "$(mkcert -CAROOT)/rootCA.pem" "$cert_dir/rootCA.pem"

echo "Certificates written to $cert_dir"
