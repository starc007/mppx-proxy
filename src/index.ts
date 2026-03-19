import { createApp } from './app'
import { runMigrations } from './db/migrate'
import { createDb } from './db/client'

// ---- Cloudflare Workers entry ----
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const { app } = createApp(env)
    return app.fetch(request, env)
  },
}

// ---- Bun entry ----
if (typeof Bun !== 'undefined') {
  const env = {
    TURSO_URL: process.env.TURSO_URL!,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
    MPP_SECRET_KEY: process.env.MPP_SECRET_KEY!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    SOLANA_NETWORK: process.env.SOLANA_NETWORK ?? 'devnet',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    VERIFY_TIMEOUT_MS: process.env.VERIFY_TIMEOUT_MS ?? '60000',
  }

  // Run DB migrations on startup
  const db = createDb(env)
  await runMigrations(db)
  console.log('DB migrations applied')

  const { app } = createApp(env)
  const server = Bun.serve({ port: 3000, fetch: app.fetch })
  console.log(`mppx-proxy running at http://localhost:${server.port}`)
}
