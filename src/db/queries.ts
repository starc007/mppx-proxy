import type { Client } from '@libsql/client'

export type ApiRow = {
  id: string
  origin_host: string
  encrypted_key: string
  key_iv: string
  owner_wallet: string
  default_price: string
  key_injection: 'header' | 'query'
  key_field: string
  created_at: number
}

export type RouteRow = {
  id: string
  api_id: string
  path_pattern: string
  price: string
  priority: number
}

export async function lookupApi(db: Client, host: string): Promise<ApiRow | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM apis WHERE origin_host = ? LIMIT 1',
    args: [host],
  })
  return (result.rows[0] as unknown as ApiRow) ?? null
}

export async function getRoutes(db: Client, apiId: string): Promise<RouteRow[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM routes WHERE api_id = ? ORDER BY priority ASC',
    args: [apiId],
  })
  return result.rows as unknown as RouteRow[]
}

export async function insertPayment(
  db: Client,
  signature: string,
  apiId: string,
  amount: string,
): Promise<'ok' | 'replayed'> {
  try {
    await db.execute({
      sql: 'INSERT INTO payments (signature, api_id, paid_at, amount) VALUES (?, ?, ?, ?)',
      args: [signature, apiId, Date.now(), amount],
    })
    return 'ok'
  } catch (e: any) {
    // UNIQUE constraint violation = replayed
    if (e?.message?.includes('UNIQUE') || e?.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return 'replayed'
    }
    throw e
  }
}

export async function registerApi(db: Client, row: Omit<ApiRow, 'created_at'>): Promise<void> {
  await db.execute({
    sql: `INSERT INTO apis (id, origin_host, encrypted_key, key_iv, owner_wallet, default_price, key_injection, key_field, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [row.id, row.origin_host, row.encrypted_key, row.key_iv, row.owner_wallet, row.default_price, row.key_injection, row.key_field, Date.now()],
  })
}

export async function upsertRoute(
  db: Client,
  id: string,
  apiId: string,
  pathPattern: string,
  price: string,
  priority: number,
): Promise<void> {
  await db.execute({
    sql: `INSERT INTO routes (id, api_id, path_pattern, price, priority) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET path_pattern=excluded.path_pattern, price=excluded.price, priority=excluded.priority`,
    args: [id, apiId, pathPattern, price, priority],
  })
}

export async function deleteRoute(db: Client, id: string): Promise<void> {
  await db.execute({ sql: 'DELETE FROM routes WHERE id = ?', args: [id] })
}

export async function getEarnings(db: Client, apiId: string): Promise<{ rows: { signature: string; amount: string; paid_at: number }[]; total: string }> {
  const result = await db.execute({
    sql: 'SELECT signature, amount, paid_at FROM payments WHERE api_id = ? ORDER BY paid_at DESC LIMIT 100',
    args: [apiId],
  })
  const rows = result.rows as unknown as { signature: string; amount: string; paid_at: number }[]
  const total = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(6)
  return { rows, total }
}
