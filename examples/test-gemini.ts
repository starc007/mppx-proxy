import { solana, Mppx } from 'mpp-solana/client'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
const privatekey = process.env.AGENT_WALLET_SECRET
const publickey = Keypair.fromSecretKey(bs58.decode(privatekey!)).publicKey.toBase58()
console.log('Derived Public Key:', publickey)
const keypair = Keypair.fromSecretKey(bs58.decode(privatekey!))
const wallet = {
  publicKey: keypair.publicKey,
  async signTransaction(tx: any) { tx.sign([keypair]); return tx },
}

const mppxClient = Mppx.create({ methods: [solana.charge({ wallet, network: 'devnet' })] })

const res = await mppxClient.fetch(
  'http://localhost:3000/generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Hello, what is 2+2?' }] }]
    }),
  }
)

console.log('Status:', res.status)
console.log('Receipt:', res.headers.get('Payment-Receipt'))
console.log(await res.json())
