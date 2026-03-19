import { expect, test } from 'bun:test'
import { resolvePrice } from '../../src/payment/price'
import type { RouteRow } from '../../src/db/queries'

const routes: RouteRow[] = [
  { id: '1', api_id: 'a', path_pattern: '/v1/premium/*', price: '0.005', priority: 0 },
  { id: '2', api_id: 'a', path_pattern: '/v1/*', price: '0.001', priority: 1 },
]

test('matches most specific route (lowest priority number first)', () => {
  expect(resolvePrice('/v1/premium/data', routes, '0.0001')).toBe('0.005')
})

test('falls back to less specific route', () => {
  expect(resolvePrice('/v1/basic/data', routes, '0.0001')).toBe('0.001')
})

test('falls back to default price when no route matches', () => {
  expect(resolvePrice('/other/path', routes, '0.0001')).toBe('0.0001')
})

test('exact path match works', () => {
  const exact: RouteRow[] = [
    { id: '3', api_id: 'a', path_pattern: '/status', price: '0.01', priority: 0 },
  ]
  expect(resolvePrice('/status', exact, '0.001')).toBe('0.01')
})

test('trailing * matches multi-segment paths', () => {
  const routes: RouteRow[] = [
    { id: '1', api_id: 'a', path_pattern: '/v1/*', price: '0.005', priority: 0 },
  ]
  expect(resolvePrice('/v1/a/b/c', routes, '0.001')).toBe('0.005')
})
