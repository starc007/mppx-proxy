import type { Client } from '@libsql/client'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS apis (
  id            TEXT PRIMARY KEY,
  origin_host   TEXT UNIQUE NOT NULL,
  encrypted_key TEXT NOT NULL,
  key_iv        TEXT NOT NULL,
  owner_wallet  TEXT NOT NULL,
  default_price TEXT NOT NULL,
  key_injection TEXT NOT NULL DEFAULT 'header',
  key_field     TEXT NOT NULL DEFAULT 'Authorization',
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS routes (
  id           TEXT PRIMARY KEY,
  api_id       TEXT NOT NULL REFERENCES apis(id),
  path_pattern TEXT NOT NULL,
  price        TEXT NOT NULL,
  priority     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  signature TEXT PRIMARY KEY,
  api_id    TEXT NOT NULL REFERENCES apis(id),
  paid_at   INTEGER NOT NULL,
  amount    TEXT NOT NULL
);
`

export async function runMigrations(db: Client): Promise<void> {
  for (const statement of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await db.execute(statement)
  }
}
