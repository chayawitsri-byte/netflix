import fs from "fs";
import path from "path";
import { generateToken } from "./utils";

const TOKEN_FILE = path.join(process.cwd(), "token.txt");

// In-memory set of used tokens (one-time use)
const usedTokens = new Set<string>();

// Position in token where the encoded index char lives
const INDEX_POS = 7;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Read all URLs from token.txt
 */
export function getUrls(): string[] {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error("token.txt not found in project root");
  }
  const content = fs.readFileSync(TOKEN_FILE, "utf-8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.startsWith("http"));
}

/**
 * Encode a URL index into a random-looking token.
 * Uses surrounding chars as a seed to obfuscate the index position.
 */
export function encodeToken(urlIndex: number): string {
  const raw = generateToken(22);
  const seed =
    raw.charCodeAt(0) +
    raw.charCodeAt(1) +
    raw.charCodeAt(2) +
    raw.charCodeAt(3);
  const encodedChar = CHARS[(urlIndex + seed) % CHARS.length];
  return raw.substring(0, INDEX_POS) + encodedChar + raw.substring(INDEX_POS + 1);
}

/**
 * Decode a token to get the URL index.
 */
export function decodeToken(token: string, totalUrls: number): number {
  const seed =
    token.charCodeAt(0) +
    token.charCodeAt(1) +
    token.charCodeAt(2) +
    token.charCodeAt(3);
  const charIndex = CHARS.indexOf(token[INDEX_POS]);
  if (charIndex === -1) return -1;
  const index = ((charIndex - (seed % CHARS.length)) % CHARS.length + CHARS.length) % CHARS.length;
  return index < totalUrls ? index : -1;
}

/**
 * Generate a single random cloaked link.
 * Picks a random URL from token.txt and encodes its index into the token.
 */
export function generateRandomLink(): { token: string; originalUrl: string } {
  const urls = getUrls();
  if (urls.length === 0) throw new Error("No valid URLs found in token.txt");

  const randomIndex = Math.floor(Math.random() * urls.length);
  const token = encodeToken(randomIndex);

  return { token, originalUrl: urls[randomIndex] };
}

/**
 * Resolve a token to the original URL (for redirect).
 * Returns null if the token is invalid.
 */
export function resolveToken(token: string): string | null {
  try {
    // Check if already used
    if (usedTokens.has(token)) return null;

    const urls = getUrls();
    if (urls.length === 0) return null;
    const index = decodeToken(token, urls.length);
    if (index < 0 || index >= urls.length) return null;

    // Mark as used (one-time only)
    usedTokens.add(token);
    return urls[index];
  } catch {
    return null;
  }
}
