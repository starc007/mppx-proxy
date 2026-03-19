import type { Hono } from 'hono'
import type { ApiRow, RouteRow } from '../db/queries'

type Deps = {
  lookupApi: (host: string) => Promise<ApiRow | null>
  getRoutes: (apiId: string) => Promise<RouteRow[]>
  decryptKey: (ciphertext: string, iv: string) => Promise<string>
  runGate: (req: Request, api: ApiRow, routes: RouteRow[]) => Promise<
    | { status: 402; response: Response }
    | { status: 200; price: string; withReceipt: (r: Response) => Response }
  >
  forward: (req: Request, api: ApiRow, plainKey: string) => Promise<Response>
}

export function createProxyRoute(app: Hono, deps: Deps): void {
  app.all('/:host/*', async (c) => {
    const host = c.req.param('host')

    const api = await deps.lookupApi(host)
    if (!api) return c.text('Not found', 404)

    const routes = await deps.getRoutes(api.id)
    const gate = await deps.runGate(c.req.raw, api, routes)

    if (gate.status === 402) return gate.response

    let originRes: Response
    try {
      const plainKey = await deps.decryptKey(api.encrypted_key, api.key_iv)
      originRes = await deps.forward(c.req.raw, api, plainKey)
    } catch {
      return c.text('Bad Gateway', 502)
    }

    return gate.withReceipt(originRes)
  })
}
