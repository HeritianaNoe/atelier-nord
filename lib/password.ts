// Server-only (Node crypto). Do NOT import from middleware or client components.
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const SCRYPT = { N: 16384, r: 8, p: 1 } as const;

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, KEY_LEN, SCRYPT, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

/** Format: `scrypt$<saltHex>$<hashHex>` (random 16-byte salt per password). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LEN) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actual, expected);
}

/** Used to spend the same time when the email is unknown (avoids revealing which emails exist). */
export const DUMMY_HASH = `scrypt$${"00".repeat(16)}$${"00".repeat(KEY_LEN)}`;
