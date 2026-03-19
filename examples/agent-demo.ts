import { solana, Mppx } from 'mpp-solana/client'
import { Keypair, Connection } from '@solana/web3.js'
import bs58 from 'bs58'

// Fund this wallet with devnet USDC before running:
// https://spl-token-faucet.com/?token-name=USDC-Dev
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.AGENT_WALLET_SECRET!))

const wallet = {
  publicKey: keypair.publicKey,
  async signTransaction(tx: any) {
    tx.sign([keypair])
    return tx
  },
}

const chargeClient = solana.charge({ wallet, network: 'devnet' })
const mppxClient = Mppx.create({ methods: [chargeClient] })

const PROXY_URL = process.env.PROXY_URL ?? 'http://localhost:3000'

console.log('Calling proxied OpenWeather API...')
const res = await mppxClient.fetch(
  `${PROXY_URL}/api.openweathermap.org/data/2.5/weather?q=London`,
)
console.log('Status:', res.status)
console.log('Payment-Receipt:', res.headers.get('Payment-Receipt'))
const data = await res.json()
console.log('Response:', JSON.stringify(data, null, 2))
