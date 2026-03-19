import { Hono } from 'hono'
import { monotonicFactory } from 'ulidx'

const monotonicUlid = monotonicFactory()
import type { Client } from '@libsql/client'
import { registerApi, lookupApi, getRoutes, upsertRoute, deleteRoute, getEarnings } from '../db/queries'
import { encryptKey } from '../crypto'
import { registerView, pricingView, earningsView, demoView } from '../dashboard/views'

type Env = { ENCRYPTION_KEY: string; DEMO_WALLET_SECRET?: string; SOLANA_NETWORK?: string }

export function createDashboardRoutes(db: Client, env: Env): Hono {
  const app = new Hono()

  app.get('/', (c) => c.html(registerView()))

  app.post('/register', async (c) => {
    const body = await c.req.parseBody()
    const { origin_host, api_key, owner_wallet, default_price, key_injection, key_field } = body as Record<string, string>
    try {
      const { ciphertext, iv } = await encryptKey(api_key, env.ENCRYPTION_KEY)
      await registerApi(db, {
        id: monotonicUlid(),
        origin_host,
        encrypted_key: ciphertext,
        key_iv: iv,
        owner_wallet,
        default_price,
        key_injection: key_injection as 'header' | 'query',
        key_field,
      })
      return c.html(registerView({ ok: true, text: `Registered! Proxy URL: https://proxy.mppx.xyz/${origin_host}/` }))
    } catch (e: any) {
      return c.html(registerView({ ok: false, text: e.message }))
    }
  })

  app.get('/pricing', async (c) => {
    const host = c.req.query('host') ?? ''
    const api = host ? await lookupApi(db, host) : null
    const routes = api ? await getRoutes(db, api.id) : []
    return c.html(pricingView(host, routes))
  })

  app.post('/routes', async (c) => {
    const body = await c.req.parseBody()
    const { host, path_pattern, price, priority } = body as Record<string, string>
    const api = await lookupApi(db, host)
    if (!api) return c.html(pricingView(host, [], { ok: false, text: 'API not found' }))
    await upsertRoute(db, monotonicUlid(), api.id, path_pattern, price, parseInt(priority ?? '0'))
    const routes = await getRoutes(db, api.id)
    return c.html(pricingView(host, routes, { ok: true, text: 'Route added.' }))
  })

  app.post('/routes/delete', async (c) => {
    const body = await c.req.parseBody()
    const { id, host } = body as Record<string, string>
    await deleteRoute(db, id)
    const api = await lookupApi(db, host)
    const routes = api ? await getRoutes(db, api.id) : []
    return c.html(pricingView(host, routes, { ok: true, text: 'Route deleted.' }))
  })

  app.get('/earnings', async (c) => {
    const host = c.req.query('host') ?? ''
    const api = host ? await lookupApi(db, host) : null
    if (!api) return c.text('API not found', 404)
    const { rows, total } = await getEarnings(db, api.id)
    return c.html(earningsView(host, total, rows))
  })

  app.get('/demo', (c) => c.html(demoView()))

  app.post('/demo/run', async (c) => {
    if (typeof Bun === 'undefined') {
      return c.json({ error: 'Demo endpoint only available in Bun mode' }, 501)
    }
    if (!env.DEMO_WALLET_SECRET) {
      return c.json({ error: 'DEMO_WALLET_SECRET not configured' }, 500)
    }
    const { prompt, model = 'gemini-2.0-flash', host = 'generativelanguage.googleapis.com' } = await c.req.json() as Record<string, string>

    const { Keypair } = await import('@solana/web3.js')
    const bs58 = await import('bs58')
    const { solana, Mppx } = await import('mpp-solana/client')

    const keypair = Keypair.fromSecretKey(bs58.default.decode(env.DEMO_WALLET_SECRET))
    const wallet = {
      publicKey: keypair.publicKey,
      async signTransaction(tx: any) { tx.sign([keypair]); return tx },
    }

    const network = (env.SOLANA_NETWORK ?? 'devnet') as 'devnet' | 'mainnet-beta'
    const mppxClient = Mppx.create({ methods: [solana.charge({ wallet, network })] })

    const proxyUrl = `http://localhost:3000/${host}/v1beta/models/${model}:generateContent`
    const res = await mppxClient.fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })

    const receipt = res.headers.get('Payment-Receipt')
    const data = await res.json()
    return c.json({ status: res.status, receipt, data })
  })

  return app
}
