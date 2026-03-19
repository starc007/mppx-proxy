import type { ApiRow } from './db/queries'

const STRIP_HEADERS = new Set(['authorization', 'host'])

/**
 * Build the outbound request to the origin API.
 * - Strips the `/{origin-host}` prefix from the path
 * - Injects the decrypted API key (header or query param)
 * - Removes proxy-internal headers (Authorization, Host)
 */
export function buildOriginRequest(
  proxyReq: Request,
  api: ApiRow,
  plainKey: string,
): Request {
  const url = new URL(proxyReq.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const originPath = '/' + segments.slice(1).join('/')

  const originUrl = new URL(`https://${api.origin_host}${originPath}`)
  // Copy query params
  url.searchParams.forEach((v, k) => originUrl.searchParams.set(k, v))

  if (api.key_injection === 'query') {
    originUrl.searchParams.set(api.key_field, plainKey)
  }

  // Copy headers, dropping proxy-internal ones
  const headers = new Headers()
  proxyReq.headers.forEach((value, key) => {
    if (!STRIP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  if (api.key_injection === 'header') {
    headers.set(api.key_field, plainKey)
  }

  return new Request(originUrl.toString(), {
    method: proxyReq.method,
    headers,
    body: proxyReq.body,
    // @ts-ignore — duplex needed in some runtimes for streaming body
    duplex: 'half',
  })
}

/**
 * Forward the built origin request and return the origin response.
 * Throws on network failure (caller converts to 502).
 */
export async function forward(originReq: Request): Promise<Response> {
  return fetch(originReq)
}
