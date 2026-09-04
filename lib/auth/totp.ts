/**
 * Minimal RFC 6238 TOTP implementation.
 *
 * Why hand-rolled?
 *  - otplib 13 requires a separate crypto plugin package we don't ship
 *  - Node's built-in `crypto` covers everything we need
 *  - Keeps the dependency surface small
 *
 * Format:
 *  - secret: base32-encoded string (no padding required)
 *  - token: 6 numeric digits, time-based, 30s step
 *  - window: 1 step before/after accepted for clock skew
 */
import { createHmac, randomBytes } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/g, '').toUpperCase().replace(/\s+/g, '');
  let bits = '';
  for (const ch of clean) {
    const v = BASE32_ALPHABET.indexOf(ch);
    if (v < 0) throw new Error(`Invalid base32 character: ${ch}`);
    bits += v.toString(2).padStart(5, '0');
  }
  const out = Buffer.alloc(Math.floor(bits.length / 8));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

function counter(time: number): Buffer {
  const c = Math.floor(time / STEP_SECONDS);
  const buf = Buffer.alloc(8);
  // big-endian 64-bit counter
  buf.writeUInt32BE(Math.floor(c / 0x100000000), 0);
  buf.writeUInt32BE(c & 0xffffffff, 4);
  return buf;
}

function hotp(secret: Buffer, time: number): string {
  const hmac = createHmac('sha1', secret).update(counter(time)).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

export const totp = {
  /** Generate a base32 secret (default 20 bytes → 32 chars). */
  generateSecret(bytes = 20): string {
    return base32Encode(randomBytes(bytes));
  },
  /** Build an `otpauth://totp/...` URI suitable for QR encoding. */
  keyuri(issuer: string, account: string, secret: string): string {
    const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: String(DIGITS),
      period: String(STEP_SECONDS),
    });
    return `otpauth://totp/${label}?${params.toString()}`;
  },
  /** Current 6-digit code for a given base32 secret. */
  generate(secret: string, time = Date.now()): string {
    return hotp(base32Decode(secret), time);
  },
  /**
   * Verify a 6-digit code. Returns true if it matches within ±window steps
   * (default ±1 → allows 30s clock drift either way).
   */
  verify(token: string, secret: string, window = 1, time = Date.now()): boolean {
    if (!/^\d{6}$/.test(token)) return false;
    const decoded = base32Decode(secret);
    for (let i = -window; i <= window; i++) {
      if (hotp(decoded, time + i * STEP_SECONDS * 1000) === token) return true;
    }
    return false;
  },
};

function base32Encode(buf: Buffer): string {
  let bits = '';
  for (const b of buf) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return out;
}
