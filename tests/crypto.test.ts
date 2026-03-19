import { expect, test } from 'bun:test'
import { encryptKey, decryptKey } from '../src/crypto'

const FAKE_KEY = 'a'.repeat(64) // 32 bytes hex

test('round-trip: decrypt(encrypt(x)) === x', async () => {
  const plaintext = 'sk-secret-api-key-12345'
  const { ciphertext, iv } = await encryptKey(plaintext, FAKE_KEY)
  const result = await decryptKey(ciphertext, iv, FAKE_KEY)
  expect(result).toBe(plaintext)
})

test('different IVs produce different ciphertexts', async () => {
  const { ciphertext: c1 } = await encryptKey('same', FAKE_KEY)
  const { ciphertext: c2 } = await encryptKey('same', FAKE_KEY)
  expect(c1).not.toBe(c2)
})

test('wrong key fails to decrypt', async () => {
  const { ciphertext, iv } = await encryptKey('secret', FAKE_KEY)
  const wrongKey = 'b'.repeat(64)
  expect(decryptKey(ciphertext, iv, wrongKey)).rejects.toThrow()
})
