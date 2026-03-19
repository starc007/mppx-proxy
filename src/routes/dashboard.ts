import { Hono } from 'hono'
import { monotonicFactory } from 'ulidx'

const monotonicUlid = monotonicFactory()
import type { Client } from '@libsql/client'
import { registerApi, lookupApi, getRoutes, upsertRoute, deleteRoute, getEarnings } from '../db/queries'
import { encryptKey } from '../crypto'
import { registerView, pricingView, earningsView } from '../dashboard/views'

type Env = { ENCRYPTION_KEY: string }

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

  return app
}
