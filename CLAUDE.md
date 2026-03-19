# mppx-proxy — Claude Guidelines

## Commands

```bash
bun dev          # run locally (auto-runs DB migrations on start)
bun test         # run all tests (18 tests)
bun run deploy   # deploy to Cloudflare Workers
```

## Key Constraints

- **Use `crypto.subtle` only** — never `node:crypto`. The proxy runs on both Cloudflare Workers and Bun; `node:crypto` is not available on Workers.
- **Use `Uint8Array(new ArrayBuffer(n))`** — not `new Uint8Array(n)`. TypeScript infers `ArrayBufferLike` for the latter, which doesn't satisfy `BufferSource` required by Web Crypto.
- **Don't commit `docs/`** — it's gitignored and contains generated specs/plans.
- **No Co-Authored-By in commits.**

## Architecture

Path-based routing: `proxy.mppx.xyz/{origin-host}/{path}` → origin API with real key injected.

Payment flow: request → 402 MPP challenge (mpp-solana) → agent pays USDC on Solana → retry with `Authorization: Payment <sig>` → verify on-chain → decrypt key → forward.

- `src/payment/gate.ts` — full 402 flow via mpp-solana `Mppx.create` + `solana.charge`
- `src/payment/store.ts` — mppx `Store` adapter backed by Turso; `put` writes to `payments` table (earnings + replay protection)
- `src/db/migrate.ts` — run once against Turso before first deploy

## Environment Variables

```
TURSO_URL            libsql://...
TURSO_AUTH_TOKEN     ...
MPP_SECRET_KEY       64-char hex (32 bytes) — signs MPP challenges
ENCRYPTION_KEY       64-char hex (32 bytes) — AES-256-GCM for API keys
SOLANA_NETWORK       devnet | mainnet-beta
SOLANA_RPC_URL       optional, falls back to public endpoints
VERIFY_TIMEOUT_MS    25000 for CF Workers, 60000 for Bun
```
