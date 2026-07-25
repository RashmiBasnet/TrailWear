# Generates the locally-trusted TLS certificate used by the Docker stack.
#
# The certificate deliberately covers three kinds of name:
#   - localhost / 127.0.0.1 / ::1  -> the browser origin and container healthchecks
#   - backend / frontend           -> the Compose service DNS names, so the
#                                     frontend's server-side HTTPS calls to
#                                     https://backend:5000 pass hostname checks
#
# rootCA.pem is copied alongside so both containers can trust the issuing CA via
# NODE_EXTRA_CA_CERTS. Because mkcert's CA is already installed in your OS/browser
# trust store (`mkcert -install`), https://localhost:3000 is trusted with no
# warning. Re-run this whenever the cert expires.
$ErrorActionPreference = "Stop"

$certDir = Join-Path $PSScriptRoot "..\certs"
New-Item -ItemType Directory -Force -Path $certDir | Out-Null

$mkcert = (Get-Command mkcert -ErrorAction SilentlyContinue).Source
if (-not $mkcert) {
    Write-Error "mkcert not found. Install it first: https://github.com/FiloSottile/mkcert"
    exit 1
}

& $mkcert -install
& $mkcert `
    -cert-file (Join-Path $certDir "localhost.pem") `
    -key-file (Join-Path $certDir "localhost-key.pem") `
    localhost 127.0.0.1 ::1 backend frontend

$caRoot = (& $mkcert -CAROOT).Trim()
Copy-Item (Join-Path $caRoot "rootCA.pem") (Join-Path $certDir "rootCA.pem") -Force

Write-Host "Certificates written to $((Resolve-Path $certDir).Path)"
