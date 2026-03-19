// tests/routes/proxy.test.ts
import { expect, test } from 'bun:test'
import { Hono } from 'hono'
import { createProxyRoute } from '../../src/routes/proxy'

// Minimal mock of what the proxy route needs
const mockApi = {
  id: 'api1', origin_host: 'api.example.com',
  encrypted_key: '', key_iv: '', owner_wallet: 'wallet1',
  default_price: '0.001', key_injection: 'header' as const,
  key_field: 'X-API-Key', created_at: 0,
}

test('returns 404 for unregistered host', async () => {
  const app = new Hono()
  createProxyRoute(app, {
    lookupApi: async () => null,
    getRoutes: async () => [],
    decryptKey: async () => 'key',
    runGate: async () => ({ status: 200 as const, price: '0.001', withReceipt: (r: Response) => r }),
    forward: async () => new Response('ok'),
  })

  const res = await app.request('/unknown.host.com/some/path')
  expect(res.status).toBe(404)
})

test('returns 402 when gate returns challenge', async () => {
  const app = new Hono()
  createProxyRoute(app, {
    lookupApi: async () => mockApi,
    getRoutes: async () => [],
    decryptKey: async () => 'key',
    runGate: async () => ({
      status: 402 as const,
      response: new Response('pay me', { status: 402 }),
    }),
    forward: async () => new Response('ok'),
  })

  const res = await app.request('/api.example.com/data')
  expect(res.status).toBe(402)
})

test('forwards to origin and returns 200 on valid payment', async () => {
  const app = new Hono()
  createProxyRoute(app, {
    lookupApi: async () => mockApi,
    getRoutes: async () => [],
    decryptKey: async () => 'plainkey',
    runGate: async () => ({ status: 200 as const, price: '0.001', withReceipt: (r: Response) => r }),
    forward: async () => new Response(JSON.stringify({ weather: 'sunny' }), { status: 200 }),
  })

  const res = await app.request('/api.example.com/data/weather')
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.weather).toBe('sunny')
})
