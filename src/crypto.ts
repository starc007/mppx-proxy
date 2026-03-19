function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

async function importKey(hexKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    hexToBytes(hexKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * ciphertext = base64(encrypted_bytes + 16-byte auth_tag) — Web Crypto appends tag automatically.
 */
export async function encryptKey(
  plaintext: string,
  hexKey: string,
): Promise<{ ciphertext: string; iv: string }> {
  const key = await importKey(hexKey)
  const ivBytes = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBytes }, key, encoded)
  return {
    ciphertext: toBase64(encrypted), // includes auth tag (appended by Web Crypto)
    iv: toBase64(ivBytes.buffer),
  }
}

/**
 * Decrypt AES-256-GCM ciphertext.
 * Throws if the key is wrong or the ciphertext is tampered (auth tag mismatch).
 */
export async function decryptKey(
  ciphertext: string,
  iv: string,
  hexKey: string,
): Promise<string> {
  const key = await importKey(hexKey)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    key,
    fromBase64(ciphertext),
  )
  return new TextDecoder().decode(decrypted)
}
