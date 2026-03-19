import { expect, test } from 'bun:test'
import { buildOriginRequest } from '../src/forwarder'
import type { ApiRow } from '../src/db/queries'

function makeApi(overrides: Partial<ApiRow> = {}): ApiRow {
  return {
    id: '1', origin_host: 'api.example.com',
    encrypted_key: '', key_iv: '', owner_wallet: '',
    default_price: '0.001', key_injection: 'header',
    key_field: 'X-API-Key', created_at: 0,
    ...overrides,
  }
}

test('strips proxy host segment from path', () => {
  const req = new Request('https://proxy.mppx.xyz/api.example.com/data/weather?q=London')
  const api = makeApi()
  const origin = buildOriginRequest(req, api, 'plainkey')
  expect(new URL(origin.url).pathname).toBe('/data/weather')
  expect(new URL(origin.url).search).toBe('?q=London')
  expect(new URL(origin.url).host).toBe('api.example.com')
})

test('injects key as header when key_injection is header', () => {
  const req = new Request('https://proxy.mppx.xyz/api.example.com/data')
  const api = makeApi({ key_injection: 'header', key_field: 'X-API-Key' })
  const origin = buildOriginRequest(req, api, 'mykey')
  expect(origin.headers.get('X-API-Key')).toBe('mykey')
})

test('injects key as query param when key_injection is query', () => {
  const req = new Request('https://proxy.mppx.xyz/api.example.com/data?city=London')
  const api = makeApi({ key_injection: 'query', key_field: 'apikey' })
  const origin = buildOriginRequest(req, api, 'mykey')
  const url = new URL(origin.url)
  expect(url.searchParams.get('apikey')).toBe('mykey')
  expect(url.searchParams.get('city')).toBe('London')
})

test('does not forward proxy-internal headers', () => {
  const req = new Request('https://proxy.mppx.xyz/api.example.com/data', {
    headers: { 'Authorization': 'Payment sig123', 'X-Forwarded-For': '1.2.3.4' },
  })
  const api = makeApi()
  const origin = buildOriginRequest(req, api, 'mykey')
  expect(origin.headers.get('Authorization')).toBeNull()
})
