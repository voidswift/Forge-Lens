import crypto from "crypto";

const DEV_ONLY_KEY = "01234567890123456789012345678901"; // 32 bytes, local development only

// Resolved lazily so importing this module (e.g. during `next build`) never needs the secret.
function getKey(): string {
  const key = process.env.DB_ENCRYPTION_KEY;
  if (key) {
    if (Buffer.byteLength(key) !== 32) throw new Error("DB_ENCRYPTION_KEY must be exactly 32 bytes.");
    return key;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DB_ENCRYPTION_KEY is required in production.");
  }
  return DEV_ONLY_KEY;
}
const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getKey()), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(text: string): string {
  if (!text) return text;
  const parts = text.split(":");
  if (parts.length !== 3) return text; // If it's not encrypted properly, return raw string
  
  try {
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getKey()), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption failed", err);
    return ""; // Security: don't leak partial data
  }
}
