import { Hono } from 'hono'
import { createDb } from './db/client'
import { lookupApi, getRoutes } from './db/queries'
import { decryptKey } from './crypto'
import { runPaymentGate } from './payment/gate'
import { buildOriginRequest, forward } from './forwarder'
import { createProxyRoute } from './routes/proxy'
import { createDashboardRoutes } from './routes/dashboard'

export type AppEnv = {
  TURSO_URL: string
  TURSO_AUTH_TOKEN: string
  MPP_SECRET_KEY: string
  ENCRYPTION_KEY: string
  SOLANA_NETWORK?: string
  SOLANA_RPC_URL?: string
  VERIFY_TIMEOUT_MS?: string
  DEMO_WALLET_SECRET?: string
}

export function createApp(env: AppEnv) {
  const db = createDb(env)
  const app = new Hono()

  // Dashboard
  const dashboard = createDashboardRoutes(db, env)
  app.route('/dashboard', dashboard)

  // Proxy (catch-all)
  createProxyRoute(app, {
    lookupApi: (host) => lookupApi(db, host),
    getRoutes: (apiId) => getRoutes(db, apiId),
    decryptKey: (ciphertext, iv) => decryptKey(ciphertext, iv, env.ENCRYPTION_KEY),
    runGate: (req, api, routes) => runPaymentGate(req, api, routes, db, env),
    forward: (req, api, plainKey) => forward(buildOriginRequest(req, api, plainKey)),
  })

  return { app, db }
}
