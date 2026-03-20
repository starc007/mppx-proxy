import { solana, Mppx } from 'mpp-solana/server'
import { PublicKey } from '@solana/web3.js'
import type { Client } from '@libsql/client'
import type { ApiRow } from '../db/queries'
import { createTursoStore } from './store'
import { resolvePrice } from './price'
import type { RouteRow } from '../db/queries'

// USDC mint addresses
const USDC_MINTS: Record<string, string> = {
  'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
}

export type GateEnv = {
  MPP_SECRET_KEY: string
  SOLANA_NETWORK?: string
  SOLANA_RPC_URL?: string
  USDC_MINT?: string
  // CF Workers have a 25s wall-clock limit; Bun can wait longer
  VERIFY_TIMEOUT_MS?: string
}

async function deriveReceiptSecret(hexKey: string): Promise<Uint8Array<ArrayBuffer>> {
  const keyBytes = hexToBytes(hexKey)
  const prefix = new TextEncoder().encode('mpp-receipt-hmac:')
  const combined = new Uint8Array(new ArrayBuffer(prefix.length + keyBytes.length))
  combined.set(prefix)
  combined.set(keyBytes, prefix.length)
  const hash = await crypto.subtle.digest('SHA-256', combined)
  return new Uint8Array(hash)
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2))
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export type GateResult =
  | { status: 402; response: Response }
  | { status: 200; price: string; withReceipt: (r: Response) => Response }

export async function runPaymentGate(
  req: Request,
  api: ApiRow,
  routes: RouteRow[],
  db: Client,
  env: GateEnv,
): Promise<GateResult> {
  const network = (env.SOLANA_NETWORK ?? 'devnet') as 'mainnet-beta' | 'devnet'
  const mint = env.USDC_MINT ?? USDC_MINTS[network]
  if (!mint) throw new Error(`Unknown SOLANA_NETWORK: ${network}`)

  // Extract path after the origin host segment for price resolution
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const path = '/' + segments.slice(1).join('/') // drop the host segment

  const price = resolvePrice(path, routes, api.default_price)
  const store = createTursoStore(db, api.id, price)
  const timeoutMs = env.VERIFY_TIMEOUT_MS ? parseInt(env.VERIFY_TIMEOUT_MS) : 25_000

  const receiptSecret = await deriveReceiptSecret(env.MPP_SECRET_KEY)

  const chargeMethod = solana.charge({
    recipient: new PublicKey(api.owner_wallet),
    mint: new PublicKey(mint),
    network,
    ...(env.SOLANA_RPC_URL ? { endpoints: [env.SOLANA_RPC_URL] } : {}),
    store,
    verifyTimeout: timeoutMs,
    receiptSecret,
  })

  const mppx = Mppx.create({
    secretKey: env.MPP_SECRET_KEY,
    methods: [chargeMethod],
  })

  const result = await mppx['solana/charge']({ amount: price })(req)

  if (result.status === 402) {
    return { status: 402, response: result.challenge }
  }

  return {
    status: 200,
    price,
    withReceipt: (r: Response) => result.withReceipt(r),
  }
}
