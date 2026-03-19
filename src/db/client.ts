import { createClient, type Client } from '@libsql/client'

export type Env = {
  TURSO_URL: string
  TURSO_AUTH_TOKEN: string
}

export function createDb(env: Env): Client {
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })
}
