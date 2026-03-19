import { expect, test, beforeEach } from 'bun:test'
import { createClient } from '@libsql/client'
import { runMigrations } from '../../src/db/migrate'
import { createTursoStore } from '../../src/payment/store'

let db: ReturnType<typeof createClient>

beforeEach(async () => {
  db = createClient({ url: ':memory:' })
  await runMigrations(db)
  // Insert a test API row (required for FK constraint)
  await db.execute({
    sql: `INSERT INTO apis (id, origin_host, encrypted_key, key_iv, owner_wallet, default_price, key_injection, key_field, created_at)
          VALUES ('api1', 'test.api.com', 'enc', 'iv', 'wallet', '0.001', 'header', 'X-API-Key', 0)`,
    args: [],
  })
})

test('get returns null for unknown key', async () => {
  const store = createTursoStore(db, 'api1', '0.001')
  expect(await store.get('solana:charge:consumed:abc')).toBeNull()
})

test('put marks key as consumed and records payment', async () => {
  const store = createTursoStore(db, 'api1', '0.001')
  await store.put('solana:charge:consumed:sig123', true)
  expect(await store.get('solana:charge:consumed:sig123')).toBe(true)
  const result = await db.execute({ sql: 'SELECT * FROM payments WHERE signature = ?', args: ['sig123'] })
  expect(result.rows.length).toBe(1)
  expect((result.rows[0] as any).amount).toBe('0.001')
})

test('second put for same sig returns without throwing (idempotent)', async () => {
  const store = createTursoStore(db, 'api1', '0.001')
  await store.put('solana:charge:consumed:sig456', true)
  // Second put should not throw even though signature is already in payments
  expect(store.put('solana:charge:consumed:sig456', true)).resolves.toBeUndefined()
})
