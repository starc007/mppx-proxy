# mppx-proxy

A reverse proxy that wraps any existing HTTP API with [MPP](https://mpp.dev) payment gating — zero code changes on the origin API.

API owners register their key and set a USDC price per call. AI agents (or any HTTP client using [`mpp-solana`](https://github.com/starc007/mpp-solana)) pay automatically via Solana and get access. No accounts, no API keys for callers — payment is the auth.

```
Agent                                  mppx-proxy                    Origin API
  │                                        │                              │
  │── GET /api.openweathermap.org/... ────▶│                              │
  │                                        │ 402 Payment Required         │
  │◀── WWW-Authenticate: MPP ─────────────│ {mint, recipient, amount}    │
  │                                        │                              │
  │  [pays USDC on Solana devnet/mainnet]  │                              │
  │                                        │                              │
  │── GET /api.openweathermap.org/... ────▶│                              │
  │   Authorization: Payment <tx-sig>      │── GET /data/2.5/weather ───▶│
  │                                        │   X-API-Key: <real-key>      │
  │◀── 200 OK + Payment-Receipt ──────────│◀── 200 OK ───────────────────│
```

## Features

- **Zero origin changes** — register any HTTP API, set a price, get a proxy URL
- **Payment = auth** — callers need no account or API key
- **Solana USDC** — ~400ms finality, sub-cent fees, payments go directly to the API owner's wallet
- **Encrypted key store** — real API keys encrypted at rest (AES-256-GCM), never exposed
- **Route-level pricing** — different prices per path pattern (`/v1/premium/*` vs `/v1/basic/*`)
- **Replay protection** — each tx signature accepted once, enforced via DB unique constraint
- **Embedded dashboard** — register APIs, configure pricing, view earnings
- **Dual runtime** — runs on Cloudflare Workers and Bun from the same codebase

## How It Works

### Setup (API owner, once)

1. Go to `/dashboard`, fill in your origin host, real API key, Solana wallet, and price
2. Get back a proxy URL: `https://proxy.mppx.xyz/api.openweathermap.org`
3. Share that URL — callers pay you in USDC per request

### Agent call (fully autonomous)

```ts
import { solana, Mppx } from 'mpp-solana/client'

const client = Mppx.create({
  methods: [solana.charge({ wallet: agentWallet, network: 'devnet' })],
})

// Automatically handles 402 → pay on Solana → retry
const res = await client.fetch(
  'https://proxy.mppx.xyz/api.openweathermap.org/data/2.5/weather?q=London',
)
const data = await res.json()
```

## URL Structure

```
https://proxy.mppx.xyz/{origin-host}/{path...}?{query}
                        └─ registered ─┘ └─ forwarded as-is ──────────┘
```

## Stack

| Layer | Choice |
|---|---|
| Server | [Hono](https://hono.dev) |
| Runtimes | Cloudflare Workers + Bun |
| Storage | [Turso](https://turso.tech) (libSQL) |
| Payment protocol | [mpp-solana](https://github.com/starc007/mpp-solana) + [mppx](https://mpp.dev) |
| Crypto | Web Crypto API (AES-256-GCM) |

## Getting Started

### Prerequisites

- [Bun](https://bun.com) v1.0+
- A [Turso](https://turso.tech) database
- A [Cloudflare](https://cloudflare.com) account (for Workers deploy)

### Install

```bash
bun install
```

### Environment variables

Create a `.dev.vars` file (never committed):

```
TURSO_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
MPP_SECRET_KEY=<64-char hex, 32 bytes>
ENCRYPTION_KEY=<64-char hex, 32 bytes>
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=
```

Generate keys:

```bash
openssl rand -hex 32   # MPP_SECRET_KEY
openssl rand -hex 32   # ENCRYPTION_KEY
```

### Run locally (Bun)

```bash
bun dev
# → DB migrations applied
# → mppx-proxy running at http://localhost:3000
```

Open `http://localhost:3000/dashboard` to register your first API.

### Deploy to Cloudflare Workers

```bash
# 1. Run DB migrations against Turso (once, before first deploy)
TURSO_URL=libsql://... TURSO_AUTH_TOKEN=... bun -e "
import { createClient } from '@libsql/client'
import { runMigrations } from './src/db/migrate.ts'
const db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN })
await runMigrations(db)
console.log('done')
"

# 2. Set secrets
wrangler secret put TURSO_URL
wrangler secret put TURSO_AUTH_TOKEN
wrangler secret put MPP_SECRET_KEY
wrangler secret put ENCRYPTION_KEY

# 3. Deploy
bun run deploy
```

### Test the 402 flow

```bash
# Register an API via the dashboard first, then:
curl -v http://localhost:3000/api.openweathermap.org/data/2.5/weather?q=London
# → HTTP/1.1 402 Payment Required
# → WWW-Authenticate: MPP ...
```

### End-to-end agent demo (devnet)

Fund a Solana devnet wallet with USDC at [spl-token-faucet.com](https://spl-token-faucet.com/?token-name=USDC-Dev), then:

```bash
AGENT_WALLET_SECRET=<base58-secret> PROXY_URL=http://localhost:3000 bun examples/agent-demo.ts
```

## Project Structure

```
src/
├── index.ts              # CF Workers export + Bun server entry
├── app.ts                # Hono app wiring
├── crypto.ts             # AES-256-GCM encrypt/decrypt (Web Crypto API)
├── forwarder.ts          # Strip proxy prefix, inject API key, forward request
├── db/
│   ├── client.ts         # Turso client init
│   ├── queries.ts        # Typed DB queries
│   └── migrate.ts        # Schema migrations
├── payment/
│   ├── gate.ts           # MPP 402 challenge + verification (mpp-solana)
│   ├── price.ts          # Route pattern → USDC price resolver
│   └── store.ts          # Turso-backed mppx Store (replay protection + earnings)
├── routes/
│   ├── proxy.ts          # Catch-all proxy route
│   └── dashboard.ts      # Dashboard HTTP handlers
└── dashboard/
    └── views.ts          # HTML views
examples/
└── agent-demo.ts         # End-to-end agent demo script
```

## Dashboard

The embedded dashboard at `/dashboard` has three views:

- **Register API** — add an origin host, real API key, Solana wallet, and default price
- **Route Pricing** (`/dashboard/pricing?host=...`) — add path patterns with per-route prices
- **Earnings** (`/dashboard/earnings?host=...`) — view payment history and total USDC earned

## Tests

```bash
bun test
```

18 tests across crypto, price resolver, store adapter, forwarder, and proxy route.

## License

MIT
