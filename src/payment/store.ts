import type { Client } from '@libsql/client'

const SIG_PREFIX = 'solana:charge:consumed:'

/**
 * mppx Store adapter backed by Turso.
 * Keys follow the mpp-solana convention: `solana:charge:consumed:<txSignature>`
 * When a key is put, the tx signature is extracted and recorded in the payments table.
 */
export function createTursoStore(db: Client, apiId: string, amount: string) {
  return {
    async get<V = unknown>(key: string): Promise<V | null> {
      const sig = key.replace(SIG_PREFIX, '')
      const result = await db.execute({
        sql: 'SELECT 1 FROM payments WHERE signature = ? LIMIT 1',
        args: [sig],
      })
      return result.rows.length > 0 ? (true as V) : null
    },

    async put(key: string, _value: unknown): Promise<void> {
      const sig = key.replace(SIG_PREFIX, '')
      try {
        await db.execute({
          sql: 'INSERT INTO payments (signature, api_id, paid_at, amount) VALUES (?, ?, ?, ?)',
          args: [sig, apiId, Date.now(), amount],
        })
      } catch (e: any) {
        // PK conflict = already recorded — safe to ignore, idempotent
        if (e?.message?.includes('UNIQUE') || e?.message?.includes('SQLITE_CONSTRAINT')) return
        throw e
      }
    },

    async delete(key: string): Promise<void> {
      const sig = key.replace(SIG_PREFIX, '')
      await db.execute({ sql: 'DELETE FROM payments WHERE signature = ?', args: [sig] })
    },
  }
}
